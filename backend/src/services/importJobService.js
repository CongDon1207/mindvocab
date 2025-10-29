import path from 'path'
import fs from 'fs/promises'
import ImportJob from '../model/ImportJob.js'
import Folder from '../model/Folder.js'
import { moveFile, resolveStorageDir } from '../utils/fileUtils.js'
import { runImportJob } from './importPipeline.js'

export async function createImportJobRecord({ folderId, file, allowUpdate = false }) {
  if (!folderId) {
    throw new Error('Thiếu folderId')
  }
  if (!file) {
    throw new Error('Thiếu file upload')
  }

  const folder = await Folder.findById(folderId)
  if (!folder) {
    throw new Error('Folder không tồn tại')
  }

  const storageRoot = resolveStorageDir()
  const job = await ImportJob.create({
    folderId,
    status: 'PENDING',
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    metadata: {
      aiProvider: process.env.AI_PROVIDER || 'gemini',
      storagePath: '',
      retries: 0,
      options: { allowUpdate: Boolean(allowUpdate) },
    },
  })

  try {
    const jobDir = path.join(storageRoot, job._id.toString())
    const destinationPath = path.join(jobDir, file.originalname)
    await moveFile(file.path, destinationPath)
    job.metadata.storagePath = destinationPath
    await job.save()

    scheduleJob(job._id)

    return job
  } catch (error) {
    await ImportJob.findByIdAndDelete(job._id)
    await fs.rm(file.path, { force: true }).catch(() => {})
    throw error
  }
}

function scheduleJob(jobId) {
  setImmediate(async () => {
    try {
      await runImportJob(jobId)
    } catch (error) {
      console.error(`[import] Job ${jobId} thất bại:`, error)
      await ImportJob.findByIdAndUpdate(jobId, {
        status: 'FAILED',
        'progress.currentStage': 'FAILED',
        $push: { 'report.errors': { stage: 'system', message: error.message } },
      })
    }
  })
}

export async function getImportJob(jobId) {
  return ImportJob.findById(jobId).select('-metadata.storagePath')
}

export async function getImportJobReport(jobId) {
  return ImportJob.findById(jobId).select('report status counters createdAt updatedAt folderId metadata.options')
}
