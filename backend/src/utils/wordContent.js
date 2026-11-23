export const WORD_HEADERS = ['word', 'meaning_vi', 'pos', 'ipa', 'note', 'ex1_en', 'ex1_vi', 'ex2_en', 'ex2_vi', 'fill_en']
export const POS_VALUES = new Set(['noun', 'verb', 'adj', 'adv', 'prep', 'phrase', 'idiom', 'other'])

const text = (value) => typeof value === 'string' ? value.trim() : ''
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const normalizeSentence = (value) => text(value).replace(/[“”]/g, '"').replace(/\s+/g, ' ')

export function createWordRegex(word, flags = 'gi') {
  const target = text(word)
  if (!target) return null
  const regexFlags = flags.includes('u') ? flags : `${flags}u`
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(target)}(?![\\p{L}\\p{N}_])`, regexFlags)
}

export function countWordOccurrences(sentence, word) {
  const regex = createWordRegex(word, 'gi')
  return regex ? (text(sentence).match(regex) || []).length : 0
}

export function isLegacyFillBlankSentence(sentence, word) {
  const normalized = normalizeSentence(sentence)
  const target = escapeRegex(text(word))
  return new RegExp(`^the trainer used\\s+"?${target}"?\\s+in a practical workplace example today\\.$`, 'i').test(normalized)
}

export function getFillBlankSentence(word) {
  const fillSentence = text(word.fillExample?.en)
  return fillSentence && !isLegacyFillBlankSentence(fillSentence, word.word)
    ? fillSentence
    : text(word.ex2?.en)
}

export function fillBlankTemplate(sentence, word) {
  const regex = createWordRegex(word, 'gi')
  return regex ? normalizeSentence(sentence).replace(regex, '<word>') : normalizeSentence(sentence)
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
  if (value.pos && !POS_VALUES.has(value.pos)) errors.push('pos is invalid.')
  for (const [field, sentence] of [['ex1_en', value.ex1.en], ['ex2_en', value.ex2.en], ['fill_en', value.fillExample.en]]) {
    if (!sentence || !value.word) continue
    const count = countWordOccurrences(sentence, value.word)
    if (count !== 1) errors.push(`${field} must contain the word exactly once (found ${count}).`)
  }
  const sentences = [value.ex1.en, value.ex2.en, value.fillExample.en].filter(Boolean)
  if (new Set(sentences).size !== sentences.length) errors.push('English sentences must be different.')
  const fillLength = value.fillExample.en.split(/\s+/).filter(Boolean).length
  if (value.fillExample.en && (fillLength < 7 || fillLength > 18)) errors.push('fill_en must contain 7 to 18 words.')
  return { value, errors }
}

export function isCompleteWord(word) { return validateWordInput(word).errors.length === 0 }
