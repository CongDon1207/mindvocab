import { createModel } from './sqliteModel.js'

const NotebookEntry = createModel('notebookEntries', (data = {}) => ({
  ...data,
  exercises: data.exercises || [],
  meta: {
    stage: 0,
    nextReviewDate: new Date(),
    lastReviewedAt: null,
    lastScore: null,
    ...(data.meta || {})
  },
}))

export default NotebookEntry
