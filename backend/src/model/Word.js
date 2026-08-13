import { createModel } from './sqliteModel.js'

const Word = createModel('words', (data = {}) => ({
  ...data,
  ipa: data.ipa ?? '', note: data.note ?? '',
  ex1: { en: '', vi: '', ...(data.ex1 || {}) }, ex2: { en: '', vi: '', ...(data.ex2 || {}) },
  fillExample: { en: '', ...(data.fillExample || {}) },
  meta: { difficulty: 0, stage: 0, nextReviewDate: new Date(), lastSeenAt: null, createdBy: 'user', ...(data.meta || {}) },
}))

export default Word
