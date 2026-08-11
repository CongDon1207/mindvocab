import { createModel } from './sqliteModel.js'

const Folder = createModel('folders', (data = {}) => ({
  ...data,
  description: data.description ?? '',
  stats: { totalWords: 0, mastered: 0, ...(data.stats || {}) },
  nextReviewDate: data.nextReviewDate ?? null,
}))

export default Folder
