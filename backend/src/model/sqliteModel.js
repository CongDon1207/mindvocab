import crypto from 'node:crypto'
import { getDatabase } from '../config/db.js'

const models = new Map()
const clone = (value) => structuredClone(value)

function parts(name) { return name.split('.').filter(Boolean) }
function getPath(value, name) { return parts(name).reduce((current, part) => current?.[part], value) }
function setPath(value, name, nextValue) {
  const path = parts(name)
  const last = path.pop()
  let current = value
  path.forEach((part) => {
    if (!current[part] || typeof current[part] !== 'object') current[part] = {}
    current = current[part]
  })
  current[last] = nextValue
}
function deletePath(value, name) {
  const path = parts(name)
  const last = path.pop()
  const parent = path.reduce((current, part) => current?.[part], value)
  if (parent && last) delete parent[last]
}
function comparable(value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const timestamp = Date.parse(value)
    if (!Number.isNaN(timestamp)) return timestamp
  }
  return value
}
function equals(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) return JSON.stringify(left) === JSON.stringify(right)
  return comparable(left) === comparable(right)
}

function matchesValue(actual, expected, options = '') {
  if (expected instanceof RegExp) return expected.test(String(actual ?? ''))
  if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
    return Object.entries(expected).every(([operator, value]) => {
      if (operator === '$regex') {
        const flags = expected.$options || options || (value instanceof RegExp ? value.flags : '')
        return new RegExp(value instanceof RegExp ? value.source : value, flags).test(String(actual ?? ''))
      }
      if (operator === '$options') return true
      if (operator === '$in') return value.some((item) => Array.isArray(actual) ? actual.some((entry) => equals(entry, item)) : equals(actual, item))
      if (operator === '$nin') return !value.some((item) => Array.isArray(actual) ? actual.some((entry) => equals(entry, item)) : equals(actual, item))
      if (operator === '$ne') return !equals(actual, value)
      if (operator === '$exists') return value ? actual !== undefined : actual === undefined
      if (operator === '$gte') return comparable(actual) >= comparable(value)
      if (operator === '$lte') return comparable(actual) <= comparable(value)
      if (operator === '$gt') return comparable(actual) > comparable(value)
      if (operator === '$lt') return comparable(actual) < comparable(value)
      return equals(actual, expected)
    })
  }
  if (Array.isArray(actual) && !Array.isArray(expected)) return actual.some((item) => equals(item, expected))
  return equals(actual, expected)
}
function matchesFilter(document, filter = {}) {
  return Object.entries(filter).every(([field, expected]) => {
    if (field === '$or') return expected.some((item) => matchesFilter(document, item))
    if (field === '$and') return expected.every((item) => matchesFilter(document, item))
    return matchesValue(getPath(document, field), expected)
  })
}
function applyUpdate(document, update = {}) {
  const result = clone(document)
  Object.entries(update.$set || {}).forEach(([field, value]) => setPath(result, field, clone(value)))
  Object.entries(update.$inc || {}).forEach(([field, value]) => setPath(result, field, Number(getPath(result, field) || 0) + Number(value)))
  Object.entries(update.$push || {}).forEach(([field, value]) => {
    const current = getPath(result, field) || []
    const values = value && value.$each ? value.$each : [value]
    setPath(result, field, [...current, ...clone(values)])
  })
  Object.entries(update).forEach(([field, value]) => {
    if (!field.startsWith('$') && !['_id', 'createdAt', 'updatedAt'].includes(field)) setPath(result, field, clone(value))
  })
  result._id = document._id
  return result
}
function project(document, selection) {
  if (!selection) return clone(document)
  const fields = typeof selection === 'string' ? selection.split(/\s+/).filter(Boolean) : Object.keys(selection)
  const excluded = fields.filter((field) => field.startsWith('-')).map((field) => field.slice(1))
  if (excluded.length) {
    const result = clone(document)
    excluded.forEach((field) => deletePath(result, field))
    return result
  }
  const result = { _id: document._id }
  fields.map((field) => field.replace(/^\+/, '')).forEach((field) => {
    const value = getPath(document, field)
    if (value !== undefined) setPath(result, field, clone(value))
  })
  return result
}
function normalizeReferences(document, collection) {
  const result = clone(document)
  const idOf = (value) => value && typeof value === 'object' && value._id ? value._id : value
  if (collection === 'sessions') {
    result.folderId = idOf(result.folderId)
    result.wordIds = (result.wordIds || []).map(idOf)
    result.wrongSet = (result.wrongSet || []).map(idOf)
  }
  if (collection === 'attempts') {
    result.sessionId = idOf(result.sessionId)
    result.wordId = idOf(result.wordId)
  }
  if (collection === 'words' || collection === 'importJobs') result.folderId = idOf(result.folderId)
  if (collection === 'importJobs') result.report.enrichedWordIds = (result.report.enrichedWordIds || []).map(idOf)
  return result
}
async function populate(document, pathName, selection) {
  const reference = pathName === 'folderId' ? models.get('folders') : models.get('words')
  if (!reference) return document
  const value = getPath(document, pathName)
  const referenceDocuments = reference._allRaw()
  const resolve = (id) => id && referenceDocuments.find((item) => item._id === id)
  const resolved = resolve(value)
  const populated = Array.isArray(value)
    ? value.map((id) => {
      const item = resolve(id)
      return item ? project(item, selection) : null
    })
    : (resolved ? project(resolved, selection) : null)
  if (value !== undefined) setPath(document, pathName, populated)
  return document
}

class Query {
  constructor(model, operation, filter = {}, update = {}) {
    this.model = model; this.operation = operation; this.filter = filter; this.update = update
    this.options = { sort: null, skip: 0, limit: null, selection: null, lean: false, populates: [] }
  }
  sort(value) { this.options.sort = value; return this }
  skip(value) { this.options.skip = Number(value) || 0; return this }
  limit(value) { this.options.limit = Number(value); return this }
  select(value) { this.options.selection = value; return this }
  lean() { this.options.lean = true; return this }
  populate(pathName, selection) { this.options.populates.push({ pathName, selection }); return this }
  async exec() {
    if (this.operation === 'delete') return this.model._deleteOne(this.filter)
    if (this.operation === 'update') return this.model._updateOne(this.filter, this.update)
    let documents = this.model._allRaw().filter((document) => matchesFilter(document, this.filter))
    if (this.options.sort) {
      const entries = Object.entries(this.options.sort)
      documents.sort((left, right) => entries.reduce((result, [field, direction]) => {
        if (result) return result
        const a = comparable(getPath(left, field)); const b = comparable(getPath(right, field))
        if (a === b) return 0
        if (a === undefined || a === null) return -1 * direction
        if (b === undefined || b === null) return 1 * direction
        return (a > b ? 1 : -1) * direction
      }, 0))
    }
    documents = documents.slice(this.options.skip)
    if (this.options.limit !== null) documents = documents.slice(0, this.options.limit)
    if (this.operation === 'one') documents = documents.slice(0, 1)
    const hydrated = []
    for (const document of documents) {
      let value = project(document, this.options.selection)
      for (const item of this.options.populates) value = await populate(value, item.pathName, item.selection)
      hydrated.push(this.options.lean ? value : this.model._fromObject(value))
    }
    return this.operation === 'one' ? hydrated[0] || null : hydrated
  }
  then(resolve, reject) { return this.exec().then(resolve, reject) }
  catch(reject) { return this.exec().catch(reject) }
}

class SqliteDocument {
  constructor(data = {}) {
    Object.assign(this, clone(data))
    Object.defineProperty(this, 'isNew', { value: !data._id, writable: true, enumerable: false })
    if (!this._id) this._id = crypto.randomUUID()
  }
  toObject() { return clone(Object.fromEntries(Object.entries(this))) }
  toJSON() { return this.toObject() }
  async save() {
    const now = new Date().toISOString()
    const record = normalizeReferences(this.toObject(), this.constructor.collection)
    record.createdAt = record.createdAt || now; record.updatedAt = now
    const database = getDatabase()
    database.prepare(`
      INSERT INTO documents (collection, id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
    `).run(this.constructor.collection, record._id, JSON.stringify(record), record.createdAt, record.updatedAt)
    this.createdAt = record.createdAt
    this.updatedAt = record.updatedAt
    this.isNew = false
    return this
  }
  async deleteOne() { return this.constructor.findByIdAndDelete(this._id) }
}

export function createModel(collection, defaults = (data) => data) {
  class Model extends SqliteDocument {
    constructor(data = {}) { super(defaults(data)) }
  }
  Model.collection = collection
  Model._allRaw = () => getDatabase().prepare('SELECT data FROM documents WHERE collection = ?').all(collection).map((row) => JSON.parse(row.data))
  Model._findOneRaw = (filter) => Model._allRaw().find((document) => matchesFilter(document, filter)) || null
  Model._fromObject = (data) => new Model(data)
  Model.find = (filter = {}) => new Query(Model, 'many', filter)
  Model.findOne = (filter = {}) => new Query(Model, 'one', filter)
  Model.findById = (id) => new Query(Model, 'one', { _id: id })
  Model.create = async (data) => new Model(data).save()
  Model.findByIdAndUpdate = (id, update) => new Query(Model, 'update', { _id: id }, update)
  Model.findByIdAndDelete = (id) => new Query(Model, 'delete', { _id: id })
  Model.countDocuments = async (filter = {}) => Model._allRaw().filter((document) => matchesFilter(document, filter)).length
  Model.updateMany = async (filter, update) => {
    const matched = Model._allRaw().filter((document) => matchesFilter(document, filter))
    let modifiedCount = 0
    for (const document of matched) {
      const updated = applyUpdate(document, update)
      if (JSON.stringify(updated) !== JSON.stringify(document)) modifiedCount += 1
      await new Model(updated).save()
    }
    return { matchedCount: matched.length, modifiedCount }
  }
  Model._updateOne = async (filter, update) => {
    const document = Model._findOneRaw(filter)
    if (!document) return null
    return new Model(applyUpdate(document, update)).save()
  }
  Model._deleteOne = async (filter) => {
    const document = Model._findOneRaw(filter)
    if (!document) return null
    getDatabase().prepare('DELETE FROM documents WHERE collection = ? AND id = ?').run(collection, document._id)
    return new Model(document)
  }
  models.set(collection, Model)
  return Model
}
