import { createModel } from './sqliteModel.js'

const ImportJob = createModel('importJobs', (data = {}) => ({
  ...data, status: data.status || 'PENDING', filename: data.filename || '', originalName: data.originalName || '', mimeType: data.mimeType || '', size: data.size || 0,
  counters: { totalLines: 0, validRows: 0, createdCount: 0, updatedCount: 0, skippedCount: 0, failedCount: 0, ...(data.counters || {}) },
  progress: { totalRecords: 0, processedRecords: 0, currentStage: 'PENDING', ...(data.progress || {}) },
  report: { errors: [], warnings: [], savedWordIds: [], skippedWords: [], ...(data.report || {}) },
  metadata: { options: { duplicatePolicy: 'skip', ...(data.metadata?.options || {}) }, records: [], ...(data.metadata || {}) },
}))

export default ImportJob
