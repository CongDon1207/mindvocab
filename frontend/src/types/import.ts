export type ImportJobStatus =
  | 'PENDING'
  | 'PARSING'
  | 'ENRICHING'
  | 'SAVING'
  | 'DONE'
  | 'FAILED'

export type ImportJobError = {
  stage: string
  message: string
  location?: string
}

export type ImportJobSkipped = {
  word: string
  reason: string
}

export type ImportJobCounters = {
  totalLines: number
  parsedOk: number
  enrichedOk: number
  duplicatesSkipped: number
  failedCount: number
}

export type ImportJobProgress = {
  totalRecords: number
  processedRecords: number
  currentStage: ImportJobStatus
  lastBatchCompleted?: number
}

export type ImportJob = {
  _id: string
  folderId: string
  status: ImportJobStatus
  filename: string
  originalName: string
  mimeType: string
  size: number
  counters: ImportJobCounters
  progress: ImportJobProgress
  report: {
    errors: ImportJobError[]
    enrichedWordIds: string[]
    skippedWords: ImportJobSkipped[]
  }
  metadata?: {
    aiProvider?: string
    options?: { allowUpdate?: boolean }
  }
  createdAt: string
  updatedAt: string
}

export type ImportJobReport = {
  _id: string
  folderId: string
  status: ImportJobStatus
  counters: ImportJobCounters
  report: {
    errors: ImportJobError[]
    enrichedWordIds: string[]
    skippedWords: ImportJobSkipped[]
  }
  metadata?: { options?: { allowUpdate?: boolean } }
  createdAt: string
  updatedAt: string
}

