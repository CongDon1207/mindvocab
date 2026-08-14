import { createImportJobRecord, getImportJob, getImportJobReport, previewImport } from '../services/importJobService.js'

export async function previewImportJob(req, res) {
  try {
    if (Buffer.byteLength(req.body.tableContent || '') > Number(process.env.IMPORT_MAX_SIZE_MB || 5) * 1024 * 1024) return res.status(413).json({ error: 'Pasted table exceeds the size limit.' })
    const result = await previewImport({ folderId: req.body.folderId, file: req.file, tableContent: req.body.tableContent })
    return res.json({ totalLines: result.totalLines, validRows: result.records.length, duplicates: result.duplicates, existingWords: result.existingWords, errors: result.errors, warnings: result.warnings })
  } catch (error) { return res.status(400).json({ error: error.message }) }
}

export async function createImportJob(req, res) {
  try {
    if (Buffer.byteLength(req.body.tableContent || '') > Number(process.env.IMPORT_MAX_SIZE_MB || 5) * 1024 * 1024) return res.status(413).json({ error: 'Pasted table exceeds the size limit.' })
    const job = await createImportJobRecord({ folderId: req.body.folderId, file: req.file, tableContent: req.body.tableContent, duplicatePolicy: req.body.duplicatePolicy || 'skip' })
    return res.status(201).json({ jobId: job._id, status: job.status })
  } catch (error) { return res.status(400).json({ error: error.message }) }
}

export async function getImportJobStatus(req, res) {
  try { const job = await getImportJob(req.params.id); return job ? res.json(job) : res.status(404).json({ error: 'Import job not found.' }) }
  catch (error) { return res.status(400).json({ error: error.message }) }
}

export async function getImportJobReportHandler(req, res) {
  try { const job = await getImportJobReport(req.params.id); return job ? res.json(job) : res.status(404).json({ error: 'Import job not found.' }) }
  catch (error) { return res.status(400).json({ error: error.message }) }
}
