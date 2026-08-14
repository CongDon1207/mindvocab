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
