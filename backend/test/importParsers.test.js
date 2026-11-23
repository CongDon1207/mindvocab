import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMarkdownTable } from '../src/utils/importParsers.js'

const header = '| word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | fill_en |'
const row = (word, fill = '') => `| ${word} | nghĩa | noun | | | The ${word} appears in a useful example sentence today. | Dịch 1 | Another ${word} appears in a different example sentence today. | Dịch 2 | ${fill} |`

test('import preview warns about empty and repeated Fill Blank templates without blocking records', () => {
  const content = [
    header,
    row('alpha'),
    row('bravo', 'The trainer used "bravo" in a practical workplace example today.'),
    row('charlie', 'The trainer used "charlie" in a practical workplace example today.'),
    row('delta', 'The trainer used "delta" in a practical workplace example today.'),
  ].join('\n')
  const result = parseMarkdownTable(content, { folderId: 'folder' })

  assert.equal(result.errors.length, 0)
  assert.equal(result.records.length, 4)
  assert.ok(result.warnings.some((item) => item.message.includes('empty')))
  assert.ok(result.warnings.some((item) => item.message.includes('legacy boilerplate')))
  assert.ok(result.warnings.some((item) => item.message.includes('same template')))
})

test('import accepts a vocabulary phrase that ends with punctuation', () => {
  const content = [
    header,
    '| I share the same belief. | meaning | phrase | | | I share the same belief. Confidence matters more than appearance in many situations. | Translation 1 | I share the same belief. People should not change themselves merely for approval. | Translation 2 | I share the same belief. Self-respect should never depend entirely on others. |',
  ].join('\n')
  const result = parseMarkdownTable(content, { folderId: 'folder' })

  assert.equal(result.errors.length, 0)
  assert.equal(result.records.length, 1)
})

test('import reports the English field and occurrence count when a word is missing or repeated', () => {
  const content = [
    header,
    '| harbor | meaning | noun | | | The harbor welcomes ships during the early morning hours. | Translation 1 | The harbor harbor remains visible from the shore today. | Translation 2 | |',
  ].join('\n')
  const result = parseMarkdownTable(content, { folderId: 'folder' })

  assert.equal(result.records.length, 0)
  assert.deepEqual(result.errors.map((item) => item.message), [
    'ex2_en must contain the word exactly once (found 2).',
  ])
})

test('import reports only the required word error when the word cell is empty', () => {
  const content = [
    header,
    '| | meaning | noun | | | An example sentence contains useful information today. | Translation 1 | Another example sentence remains useful today. | Translation 2 | |',
  ].join('\n')
  const result = parseMarkdownTable(content, { folderId: 'folder' })

  assert.deepEqual(result.errors.map((item) => item.message), ['word is required.'])
})
