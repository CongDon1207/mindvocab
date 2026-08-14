export type ImportJobStatus = 'PENDING' | 'SAVING' | 'DONE' | 'FAILED'
export type ImportJobError = { stage: string; message: string; location?: string }
export type ImportJobWarning = { stage: string; message: string; location?: string }
export type ImportJobSkipped = { word: string; reason: string }
export type ImportJobCounters = { totalLines: number; validRows: number; createdCount: number; updatedCount: number; skippedCount: number; failedCount: number }
export type ImportJobProgress = { totalRecords: number; processedRecords: number; currentStage: ImportJobStatus }
export type ImportJob = { _id: string; folderId: string; status: ImportJobStatus; filename: string; originalName: string; mimeType: string; size: number; counters: ImportJobCounters; progress: ImportJobProgress; report: { errors: ImportJobError[]; warnings: ImportJobWarning[]; savedWordIds: string[]; skippedWords: ImportJobSkipped[] }; metadata?: { options?: { duplicatePolicy?: 'skip' | 'fill_missing' | 'overwrite' } }; createdAt: string; updatedAt: string }
export type ImportJobReport = Pick<ImportJob, '_id' | 'folderId' | 'status' | 'counters' | 'report' | 'metadata' | 'createdAt' | 'updatedAt'>
