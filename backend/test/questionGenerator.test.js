import test from 'node:test'
import assert from 'node:assert/strict'
import { generateFillBlank } from '../src/utils/questionGenerator.js'
import { getFillBlankSentence, isCompleteWord } from '../src/utils/wordContent.js'
import { shouldRegenerateFillBlank } from '../src/controllers/sessionController.js'

const session = { seed: 123 }

function word(id, value, sentence) {
  return { _id: id, word: value, fillExample: { en: sentence }, ex2: { en: `The ${value} example remains useful in this sentence today.` } }
}

test('generateFillBlank replaces an exact multi-word phrase', async () => {
  const questions = await generateFillBlank(session, [
    word('phrase', 'a broad range', 'The store offers a broad range of office supplies for local businesses.'),
  ])

  assert.equal(questions[0].prompt, 'The store offers _____ of office supplies for local businesses.')
  assert.equal(questions[0].answer, 'a broad range')
})

test('generateFillBlank keeps single-word matching behavior', async () => {
  const questions = await generateFillBlank(session, [
    word('single', 'adjacent', 'The adjacent office remains open during the building renovation this week.'),
  ])

  assert.equal(questions[0].prompt, 'The _____ office remains open during the building renovation this week.')
  assert.equal(questions[0].answer, 'adjacent')
})

test('Fill Blank prefers a natural fill_en and falls back for blank or boilerplate values', () => {
  const natural = word('natural', 'harbor', 'The harbor remained calm despite the rain overnight.')
  const blank = word('blank', 'harbor', '')
  const boilerplate = word('legacy', 'harbor', 'The trainer used “harbor” in a practical workplace example today.')

  assert.equal(getFillBlankSentence(natural), natural.fillExample.en)
  assert.equal(getFillBlankSentence(blank), blank.ex2.en)
  assert.equal(getFillBlankSentence(boilerplate), boilerplate.ex2.en)
  assert.equal(isCompleteWord({ ...blank, meaning_vi: 'bến cảng', pos: 'noun', ex1: { en: 'The harbor welcomed ships during the early morning hours.', vi: 'Dịch 1' }, ex2: { en: blank.ex2.en, vi: 'Dịch 2' } }), true)
})

test('only untouched unfinished sessions refresh legacy Fill Blank questions', () => {
  const session = { completedAt: null, fillBlank: { questions: [{ prompt: 'The trainer used "_____" in a practical workplace example today.' }] } }
  assert.equal(shouldRegenerateFillBlank(session, []), true)
  assert.equal(shouldRegenerateFillBlank(session, [{ step: 'FILL_BLANK' }]), false)
  assert.equal(shouldRegenerateFillBlank({ ...session, completedAt: '2026-08-13T00:00:00.000Z' }, []), false)
})
