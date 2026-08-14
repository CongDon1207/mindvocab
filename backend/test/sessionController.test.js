import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mindvocab-session-'))
process.env.SQLITE_DB_PATH = path.join(testDirectory, 'test.sqlite')

const { connectDB, getDatabase } = await import('../src/config/db.js')
const { default: Folder } = await import('../src/model/Folder.js')
const { default: Session } = await import('../src/model/Session.js')
const { default: Word } = await import('../src/model/Word.js')
const { createNextSession } = await import('../src/controllers/sessionController.js')

await connectDB()

after(() => {
  getDatabase().close()
  fs.rmSync(testDirectory, { recursive: true, force: true })
})

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('createNextSession skips an unfinished sequential batch', async () => {
  const folder = await Folder.create({ name: 'Sequential folder' })
  const words = []
  for (let index = 0; index < 20; index += 1) {
    const value = `word${String(index).padStart(2, '0')}`
    words.push(await Word.create({
      folderId: folder._id,
      word: value,
      meaning_vi: `meaning ${index}`,
      pos: 'noun',
      ex1: { en: `The ${value} appears in the first complete example sentence.`, vi: `Example one ${index}` },
      ex2: { en: `Another ${value} appears in the second complete example sentence.`, vi: `Example two ${index}` },
    }))
  }
  const previous = await Session.create({
    folderId: folder._id,
    mode: 'sequential',
    wordIds: words.slice(0, 10).map((word) => word._id),
    batchStartIndex: 0,
    completedAt: null,
  })
  const response = responseRecorder()

  await createNextSession({ body: { previousSessionId: previous._id } }, response)

  assert.equal(response.statusCode, 201)
  assert.notEqual(response.body._id, previous._id)
  assert.equal(response.body.batchStartIndex, 10)
  assert.deepEqual(response.body.wordIds, words.slice(10, 20).map((word) => word._id))
})
