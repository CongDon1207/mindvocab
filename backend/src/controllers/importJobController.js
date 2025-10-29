import { createImportJobRecord, getImportJob, getImportJobReport } from '../services/importJobService.js'

function parseBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  }
  return false
}

export async function createImportJob(req, res) {
  try {
    const { folderId } = req.body
    const allowUpdate = parseBoolean(req.body.allowUpdate)

    if (!req.file) {
      return res.status(400).json({ error: 'Thiếu file upload.' })
    }

    const job = await createImportJobRecord({
      folderId,
      file: req.file,
      allowUpdate,
    })

    return res.status(201).json({
      jobId: job._id,
      status: job.status,
    })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export async function getImportJobStatus(req, res) {
  try {
    const job = await getImportJob(req.params.id)
    if (!job) {
      return res.status(404).json({ error: 'Không tìm thấy import job.' })
    }
    return res.json(job)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export async function getImportJobReportHandler(req, res) {
  try {
    const job = await getImportJobReport(req.params.id)
    if (!job) {
      return res.status(404).json({ error: 'Không tìm thấy import job.' })
    }
    return res.json(job)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

