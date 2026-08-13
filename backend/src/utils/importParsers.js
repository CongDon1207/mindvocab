import path from 'node:path'
import xlsx from 'xlsx'
import { WORD_HEADERS, normalizeWordInput, validateWordInput } from './wordContent.js'

const error = (location, message) => ({ stage: 'parse', location, message })
const cell = (value) => String(value ?? '').trim()

function parseRows(rows, folderId, source) {
  const header = (rows[0] || []).map(cell)
  if (header.length !== WORD_HEADERS.length || header.some((value, index) => value !== WORD_HEADERS[index])) {
    return { type: source, totalLines: Math.max(0, rows.length - 1), records: [], duplicates: [], errors: [error('header', `Headers must be exactly: ${WORD_HEADERS.join(', ')}`)] }
  }
  const records = []; const duplicates = []; const errors = []; const seen = new Set()
  rows.slice(1).forEach((row, index) => {
    const values = Array.from({ length: WORD_HEADERS.length }, (_, column) => cell(row[column]))
    if (!values.some(Boolean)) return
    if (row.length > WORD_HEADERS.length) { errors.push(error(`row ${index + 2}`, 'Too many columns.')); return }
    const input = Object.fromEntries(WORD_HEADERS.map((headerName, column) => [headerName, values[column]]))
    const { value, errors: rowErrors } = validateWordInput(input)
    if (rowErrors.length) { errors.push(...rowErrors.map((message) => error(`row ${index + 2}`, message))); return }
    const key = value.word.toLowerCase()
    if (seen.has(key)) { duplicates.push(value.word); return }
    seen.add(key); records.push({ folderId, ...value, normalizedWord: key })
  })
  return { type: source, totalLines: Math.max(0, rows.length - 1), records, duplicates, errors }
}

function splitMarkdownRow(line) {
  const text = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return text.split('|').map((value) => value.trim().replace(/\\\|/g, '|'))
}

function isDivider(row) { return row.length === WORD_HEADERS.length && row.every((cellValue) => /^:?-{3,}:?$/.test(cellValue)) }

export function parseMarkdownTable(content, { folderId }) {
  const lines = String(content || '').split(/\r?\n/).filter((line) => line.trim())
  const rows = lines.map(splitMarkdownRow)
  if (rows[1] && isDivider(rows[1])) rows.splice(1, 1)
  return parseRows(rows, folderId, 'markdown')
}

export async function parseXlsxFile(filePath, { folderId }) {
  const workbook = xlsx.readFile(filePath, { cellFormula: false, cellHTML: false, cellText: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return { type: 'xlsx', totalLines: 0, records: [], duplicates: [], errors: [error('sheet 1', 'Workbook has no worksheet.')] }
  return parseRows(xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false }), folderId, 'xlsx')
}

export async function parseImportSource({ file, tableContent, folderId }) {
  if (tableContent) return parseMarkdownTable(tableContent, { folderId })
  if (!file) throw new Error('Provide a Markdown table or an .xlsx file.')
  if (path.extname(file.path).toLowerCase() !== '.xlsx') throw new Error('Only .xlsx files are supported.')
  return parseXlsxFile(file.path, { folderId })
}
