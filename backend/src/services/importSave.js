import Word from '../model/Word.js'
import Folder from '../model/Folder.js'
import { escapeRegex } from '../utils/regex.js'

function buildWordDocument(record) {
  const doc = {
    folderId: record.folderId,
    word: record.word,
    pos: record.pos || 'noun',
    meaning_vi: record.meaning_vi,
    ipa: record.ipa || '',
    note: record.note || '',
    tags: record.tags || [],
    ex1: record.examples[0]
      ? { ...record.examples[0], source: record.examples[0].source || 'user' }
      : { en: '', vi: '', source: 'user' },
    ex2: record.examples[1]
      ? { ...record.examples[1], source: record.examples[1].source || 'user' }
      : { en: '', vi: '', source: 'user' },
    sources: {
      meaning_vi: 'user',
      pos: record.fieldSources.pos || 'inferred',
      ipa: record.fieldSources.ipa || 'inferred',
      note: record.fieldSources.note || 'inferred',
    },
    meta: {
      difficulty: 0,
      lastSeenAt: null,
      createdBy: 'user',
    },
  }

  return doc
}

export async function saveRecords(job, records, jobState) {
  let savedCount = 0
  const enrichedWordIds = []
  const allowUpdate = job.metadata?.options?.allowUpdate

  for (const record of records) {
    const regex = new RegExp(`^${escapeRegex(record.word)}$`, 'i')
    const existing = await Word.findOne({ folderId: job.folderId, word: { $regex: regex } })

    if (existing && !allowUpdate) {
      jobState.processed += 1
      jobState.addSkipped({
        word: existing.word,
        reason: 'Đã tồn tại trong folder, chưa bật cho phép cập nhật',
      })
      continue
    }

    try {
      if (!existing) {
        const created = await Word.create(buildWordDocument(record))
        enrichedWordIds.push(created._id)
        savedCount += 1
      } else {
        const updates = {}
        const sources = existing.sources || {}

        if (record.pos && (allowUpdate || !existing.pos)) {
          updates.pos = record.pos
          sources.pos = record.fieldSources.pos
        }
        if (record.ipa && (allowUpdate || !existing.ipa)) {
          updates.ipa = record.ipa
          sources.ipa = record.fieldSources.ipa
        }
        if (record.note && (allowUpdate || !existing.note)) {
          updates.note = record.note
          sources.note = record.fieldSources.note
        }
        if (record.tags?.length) {
          updates.tags = Array.from(new Set([...(existing.tags || []), ...record.tags]))
        }

        if (record.examples[0] && (allowUpdate || !existing.ex1?.en)) {
          updates.ex1 = { ...record.examples[0], source: record.examples[0].source || 'user' }
        }
        if (record.examples[1] && (allowUpdate || !existing.ex2?.en)) {
          updates.ex2 = { ...record.examples[1], source: record.examples[1].source || 'user' }
        }

        if (Object.keys(updates).length) {
          updates.sources = {
            meaning_vi: sources.meaning_vi || 'user',
            pos: sources.pos || record.fieldSources.pos || 'inferred',
            ipa: sources.ipa || record.fieldSources.ipa || 'inferred',
            note: sources.note || record.fieldSources.note || 'inferred',
          }

          const updated = await Word.findByIdAndUpdate(existing._id, updates, { new: true })
          enrichedWordIds.push(updated._id)
        } else {
          jobState.addSkipped({
            word: existing.word,
            reason: 'Dữ liệu hiện có đã đầy đủ',
          })
        }
      }

      jobState.processed += 1
    } catch (error) {
      jobState.addError({
        stage: 'save',
        message: error.message,
        location: record.word,
      })
    }
  }

  if (savedCount > 0) {
    await Folder.findByIdAndUpdate(job.folderId, {
      $inc: { 'stats.totalWords': savedCount },
    })
  }

  return { savedCount, enrichedWordIds }
}
