import Word from '../model/Word.js'
import { getDatabase } from '../config/db.js'

function mergeMissing(existing, record) {
  return {
    word: existing.word, meaning_vi: existing.meaning_vi || record.meaning_vi, pos: existing.pos || record.pos,
    ipa: existing.ipa || record.ipa, note: existing.note || record.note,
    ex1: { en: existing.ex1?.en || record.ex1.en, vi: existing.ex1?.vi || record.ex1.vi },
    ex2: { en: existing.ex2?.en || record.ex2.en, vi: existing.ex2?.vi || record.ex2.vi },
    fillExample: { en: existing.fillExample?.en || record.fillExample.en },
  }
}

export async function saveRecords(job, records) {
  const summary = { createdCount: 0, updatedCount: 0, skippedCount: 0, savedWordIds: [], skippedWords: [] }
  const policy = job.metadata?.options?.duplicatePolicy || 'skip'; const database = getDatabase()
  database.exec('BEGIN IMMEDIATE')
  try {
    for (const record of records) {
      const existing = await Word.findOne({ folderId: job.folderId, normalizedWord: record.normalizedWord })
      if (!existing) {
        const created = await Word.create({ ...record }); summary.createdCount += 1; summary.savedWordIds.push(created._id); continue
      }
      if (policy === 'skip') { summary.skippedCount += 1; summary.skippedWords.push({ word: existing.word, reason: 'Already exists in this folder.' }); continue }
      const update = policy === 'overwrite' ? record : mergeMissing(existing, record)
      const saved = await Word.findByIdAndUpdate(existing._id, update, { new: true })
      summary.updatedCount += 1; summary.savedWordIds.push(saved._id)
    }
    database.exec('COMMIT'); return summary
  } catch (error) { database.exec('ROLLBACK'); throw error }
}
