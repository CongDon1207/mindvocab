export const WORD_HEADERS = ['word', 'meaning_vi', 'pos', 'ipa', 'note', 'ex1_en', 'ex1_vi', 'ex2_en', 'ex2_vi', 'fill_en']
export const POS_VALUES = new Set(['noun', 'verb', 'adj', 'adv', 'prep', 'phrase', 'idiom', 'other'])

const text = (value) => typeof value === 'string' ? value.trim() : ''
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function sentenceHasWordOnce(sentence, word) {
  return (text(sentence).match(new RegExp(`\\b${escapeRegex(text(word))}\\b`, 'gi')) || []).length === 1
}

export function normalizeWordInput(data = {}) {
  return {
    word: text(data.word), meaning_vi: text(data.meaning_vi), pos: text(data.pos).toLowerCase(), ipa: text(data.ipa), note: text(data.note),
    ex1: { en: text(data.ex1_en ?? data.ex1?.en), vi: text(data.ex1_vi ?? data.ex1?.vi) },
    ex2: { en: text(data.ex2_en ?? data.ex2?.en), vi: text(data.ex2_vi ?? data.ex2?.vi) },
    fillExample: { en: text(data.fill_en ?? data.fillExample?.en) },
  }
}

export function validateWordInput(input) {
  const value = normalizeWordInput(input)
  const errors = []
  for (const field of ['word', 'meaning_vi', 'pos']) if (!value[field]) errors.push(`${field} is required.`)
  for (const field of ['ex1', 'ex2']) {
    if (!value[field].en) errors.push(`${field}_en is required.`)
    if (!value[field].vi) errors.push(`${field}_vi is required.`)
  }
  if (!value.fillExample.en) errors.push('fill_en is required.')
  if (value.pos && !POS_VALUES.has(value.pos)) errors.push('pos is invalid.')
  for (const sentence of [value.ex1.en, value.ex2.en, value.fillExample.en]) if (sentence && !sentenceHasWordOnce(sentence, value.word)) errors.push('Each English sentence must contain the word exactly once.')
  const sentences = [value.ex1.en, value.ex2.en, value.fillExample.en]
  if (new Set(sentences).size !== sentences.length) errors.push('English sentences must be different.')
  const fillLength = value.fillExample.en.split(/\s+/).filter(Boolean).length
  if (value.fillExample.en && (fillLength < 7 || fillLength > 18)) errors.push('fill_en must contain 7 to 18 words.')
  return { value, errors }
}

export function isCompleteWord(word) { return validateWordInput(word).errors.length === 0 }
