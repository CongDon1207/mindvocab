import { createModel } from './sqliteModel.js'

const Word = createModel('words', (data = {}) => ({
  ...data,
  ipa: data.ipa ?? '',
  note: data.note ?? '',
  ex1: { en: '', vi: '', source: 'user', ...(data.ex1 || {}) },
  ex2: { en: '', vi: '', source: 'user', ...(data.ex2 || {}) },
  tags: data.tags || [],
  sources: {
    meaning_vi: 'user', pos: 'user', ipa: 'user', note: 'user', ...(data.sources || {})
  },
  meta: {
    difficulty: 0,
    stage: 0,
    nextReviewDate: new Date(),
    lastSeenAt: null,
    createdBy: 'user',
    ...(data.meta || {})
  },
}))

export default Word
