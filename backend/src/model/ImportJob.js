import { createModel } from './sqliteModel.js'

const ImportJob = createModel('importJobs', (data = {}) => ({
  ...data,
  status: data.status || 'PENDING',
  filename: data.filename || '',
  originalName: data.originalName || '',
  mimeType: data.mimeType || '',
  size: data.size || 0,
  counters: {
    totalLines: 0, parsedOk: 0, enrichedOk: 0, duplicatesSkipped: 0, failedCount: 0,
    ...(data.counters || {})
  },
  progress: {
    totalRecords: 0, processedRecords: 0, currentStage: 'PENDING', lastBatchCompleted: 0,
    ...(data.progress || {})
  },
  report: {
    errors: [], enrichedWordIds: [], skippedWords: [], ...(data.report || {})
  },
  metadata: {
    aiProvider: '', storagePath: '', retries: 0,
    options: { allowUpdate: false, ...(data.metadata?.options || {}) },
    ...(data.metadata || {})
  },
}))

export default ImportJob
