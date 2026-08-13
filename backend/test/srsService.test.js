import test from 'node:test'
import assert from 'node:assert/strict'
import { nextSrsMeta, selectSrsWords, startOfTomorrow, summarizeAttempts } from '../src/services/srsService.js'

const now = new Date('2026-08-12T10:00:00')
const word = (id, meta = {}) => ({ _id: id, createdAt: '2026-01-01T00:00:00.000Z', meta })
const attempt = (wordId, step, isCorrect) => ({ wordId, step, isCorrect })

test('selectSrsWords prioritizes overdue, due today, then new words', () => {
  const { words, selectionSummary } = selectSrsWords([
    word('future', { lastSeenAt: '2026-08-01', nextReviewDate: '2026-08-20' }),
    word('new', {}),
    word('today', { lastSeenAt: '2026-08-01', nextReviewDate: '2026-08-12T18:00:00' }),
    word('overdue', { lastSeenAt: '2026-08-01', nextReviewDate: '2026-08-10' }),
  ], now)
  assert.deepEqual(words.map((item) => item._id), ['overdue', 'today', 'new'])
  assert.deepEqual(selectionSummary, { dueCount: 2, newCount: 1 })
})

test('selectSrsWords does not fill with future-due learned words', () => {
  const { words } = selectSrsWords([word('future', { lastSeenAt: '2026-08-01', nextReviewDate: '2026-09-01' })], now)
  assert.equal(words.length, 0)
})

test('summarizeAttempts uses only each first answer and includes Fill Blank', () => {
  const result = summarizeAttempts(['one'], [
    attempt('one', 'QUIZ_PART1', true), attempt('one', 'QUIZ_PART2', true),
    attempt('one', 'SPELLING', false), attempt('one', 'SPELLING', true), attempt('one', 'FILL_BLANK', false),
  ])
  assert.deepEqual(result.incompleteWordIds, [])
  assert.deepEqual(result.results[0], { wordId: 'one', correct: 2, total: 4, outcome: 'reinforce' })
})

test('nextSrsMeta applies the approved stage and scheduling rules', () => {
  assert.equal(nextSrsMeta({ stage: 2, difficulty: 2 }, 'strong', now).stage, 3)
  assert.equal(nextSrsMeta({ stage: 2, difficulty: 2 }, 'strong', now).nextReviewDate.getDate(), 26)
  const reinforce = nextSrsMeta({ stage: 2, difficulty: 2 }, 'reinforce', now)
  assert.equal(reinforce.stage, 2)
  assert.equal(reinforce.nextReviewDate.toISOString(), startOfTomorrow(now).toISOString())
  assert.equal(nextSrsMeta({ stage: 0, difficulty: 0 }, 'forgotten', now).stage, 0)
})
