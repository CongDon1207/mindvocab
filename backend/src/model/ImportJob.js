import mongoose from 'mongoose'

const ErrorSchema = new mongoose.Schema(
  {
    stage: { type: String, default: '' },
    message: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
)

const SkippedSchema = new mongoose.Schema(
  {
    word: { type: String, default: '' },
    reason: { type: String, default: '' },
  },
  { _id: false }
)

const ImportJobSchema = new mongoose.Schema(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      index: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARSING', 'ENRICHING', 'SAVING', 'DONE', 'FAILED'],
      default: 'PENDING',
    },
    filename: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    counters: {
      totalLines: { type: Number, default: 0 },
      parsedOk: { type: Number, default: 0 },
      enrichedOk: { type: Number, default: 0 },
      duplicatesSkipped: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
    },
    progress: {
      totalRecords: { type: Number, default: 0 },
      processedRecords: { type: Number, default: 0 },
      currentStage: { type: String, default: 'PENDING' },
      lastBatchCompleted: { type: Number, default: 0 },
    },
    report: {
      errors: { type: [ErrorSchema], default: [] },
      enrichedWordIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Word',
        default: [],
      },
      skippedWords: { type: [SkippedSchema], default: [] },
    },
    metadata: {
      aiProvider: { type: String, default: '' },
      storagePath: { type: String, default: '' },
      retries: { type: Number, default: 0 },
      options: {
        allowUpdate: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
)

const ImportJob = mongoose.model('ImportJob', ImportJobSchema)
export default ImportJob

