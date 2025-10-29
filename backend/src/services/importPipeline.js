import path from 'path'
import ImportJob from '../model/ImportJob.js'
import { parseImportFile } from '../utils/importParsers.js'
import { buildProviderChain } from './aiProviders.js'
import { removeDir } from '../utils/fileUtils.js'
import { processEnrichment } from './importEnrich.js'
import { saveRecords } from './importSave.js'

function createJobState() {
  return {
    errors: [],
    skipped: [],
    processed: 0,
    addError(error) {
      this.errors.push(error)
    },
    addSkipped(item) {
      this.skipped.push(item)
    },
  }
}

async function updateJob(jobId, update) {
  await ImportJob.findByIdAndUpdate(jobId, update, { new: false })
}

function toSkipped(word, reason) {
  return { word, reason }
}

async function cleanupStorage(job) {
  if (job?.metadata?.storagePath) {
    const dirPath = path.dirname(job.metadata.storagePath)
    await removeDir(dirPath)
  }
}

export async function runImportJob(jobId) {
  const job = await ImportJob.findById(jobId)
  if (!job) return

  const jobState = createJobState()

  try {
    await updateJob(jobId, {
      status: 'PARSING',
      'progress.currentStage': 'PARSING',
    })

    const parseResult = await parseImportFile(job.metadata.storagePath, {
      folderId: job.folderId,
    })

    await updateJob(jobId, {
      'counters.totalLines': parseResult.totalLines,
      'counters.parsedOk': parseResult.records.length,
      'counters.duplicatesSkipped': parseResult.duplicates.length,
      'progress.totalRecords': parseResult.records.length,
      'progress.processedRecords': 0,
      $push: {
        'report.errors': { $each: parseResult.errors },
        'report.skippedWords': {
          $each: parseResult.duplicates.map((word) => toSkipped(word, 'Trùng trong file')),
        },
      },
    })

    const records = parseResult.records

    if (!records.length) {
      await updateJob(jobId, {
        status: 'FAILED',
        'progress.currentStage': 'FAILED',
        'counters.failedCount': parseResult.totalLines,
      })
      await cleanupStorage(job)
      return
    }

    const providers = buildProviderChain()

    await updateJob(jobId, {
      status: 'ENRICHING',
      'progress.currentStage': 'ENRICHING',
    })

    const { enrichedCount } = await processEnrichment(records, providers, jobState)

    await updateJob(jobId, {
      status: 'SAVING',
      'progress.currentStage': 'SAVING',
      'counters.enrichedOk': enrichedCount,
    })

    const { savedCount, enrichedWordIds } = await saveRecords(job, records, jobState)

    await updateJob(jobId, {
      'progress.processedRecords': jobState.processed,
      'report.enrichedWordIds': enrichedWordIds,
      $push: {
        'report.errors': { $each: jobState.errors },
        'report.skippedWords': { $each: jobState.skipped },
      },
      'counters.failedCount': jobState.errors.length,
      status: savedCount > 0 ? 'DONE' : 'FAILED',
      'progress.currentStage': savedCount > 0 ? 'DONE' : 'FAILED',
    })
  } catch (error) {
    await updateJob(jobId, {
      status: 'FAILED',
      'progress.currentStage': 'FAILED',
      $push: {
        'report.errors': [{ stage: 'system', message: error.message, location: 'pipeline' }],
      },
    })
    throw error
  } finally {
    await cleanupStorage(job)
  }
}

