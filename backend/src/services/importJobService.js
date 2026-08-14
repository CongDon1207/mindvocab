import ImportJob from '../model/ImportJob.js'
import Folder from '../model/Folder.js'
import Word from '../model/Word.js'
import { parseImportSource } from '../utils/importParsers.js'
import { saveRecords } from './importSave.js'

const POLICIES = new Set(['skip', 'fill_missing', 'overwrite'])

export async function previewImport({ folderId, file, tableContent }) {
  if (!folderId) throw new Error('folderId is required.')
  if (!await Folder.findById(folderId)) throw new Error('Folder not found.')
  const parsed = await parseImportSource({ folderId, file, tableContent })
  const words = await Word.find({ folderId })
  const keys = new Set(words.map((word) => word.word.toLowerCase().trim()))
  return { ...parsed, existingWords: parsed.records.filter((record) => keys.has(record.normalizedWord)).map((record) => record.word) }
}

export async function createImportJobRecord({ folderId, file, tableContent, duplicatePolicy }) {
  if (!POLICIES.has(duplicatePolicy)) throw new Error('duplicatePolicy is invalid.')
  const parsed = await previewImport({ folderId, file, tableContent })
  if (parsed.errors.length || !parsed.records.length) throw new Error(parsed.errors[0]?.message || 'No valid rows to import.')
  const job = await ImportJob.create({ folderId, status: 'SAVING', filename: file?.filename || 'pasted-table.md', originalName: file?.originalname || 'Pasted Markdown table', mimeType: file?.mimetype || 'text/markdown', size: file?.size || Buffer.byteLength(tableContent || ''), counters: { totalLines: parsed.totalLines, validRows: parsed.records.length, skippedCount: parsed.duplicates.length }, progress: { totalRecords: parsed.records.length, currentStage: 'SAVING' }, report: { errors: parsed.errors, warnings: parsed.warnings, skippedWords: parsed.duplicates.map((word) => ({ word, reason: 'Duplicate in import.' })) }, metadata: { options: { duplicatePolicy }, records: parsed.records } })
  setImmediate(() => runImportJob(job._id))
  return job
}

async function runImportJob(jobId) {
  const job = await ImportJob.findById(jobId); if (!job) return
  try {
    const result = await saveRecords(job, job.metadata.records || [])
    result.skippedCount += job.counters.skippedCount || 0
    await ImportJob.findByIdAndUpdate(jobId, { status: 'DONE', counters: { ...job.counters, ...result }, progress: { ...job.progress, processedRecords: job.metadata.records.length, currentStage: 'DONE' }, report: { ...job.report, savedWordIds: result.savedWordIds, skippedWords: [...(job.report.skippedWords || []), ...result.skippedWords] }, 'metadata.records': [] })
  } catch (error) { await ImportJob.findByIdAndUpdate(jobId, { status: 'FAILED', 'progress.currentStage': 'FAILED', $push: { 'report.errors': { stage: 'save', message: error.message } } }) }
}

export const getImportJob = (jobId) => ImportJob.findById(jobId).select('-metadata.records')
export const getImportJobReport = (jobId) => ImportJob.findById(jobId).select('report status counters createdAt updatedAt folderId metadata.options')
