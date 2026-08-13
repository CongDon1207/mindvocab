import Session from '../model/Session.js'
import Attempt from '../model/Attempt.js'
import Word from '../model/Word.js'
import { getDatabase } from '../config/db.js'
import { nextSrsMeta, summarizeAttempts } from '../services/srsService.js'

function failure(status, code, message) {
  const error = new Error(message)
  error.status = status
  error.code = code
  return error
}

function responseFor(session, alreadyCompleted) {
  return { ...(session.completionResult || {}), alreadyCompleted }
}

export async function completeSession(req, res) {
  const database = getDatabase()
  let started = false
  try {
    database.exec('BEGIN IMMEDIATE')
    started = true
    const rawSession = Session._findOneRaw({ _id: req.params.id })
    if (!rawSession) throw failure(404, 'SESSION_NOT_FOUND', 'Session not found.')
    const session = Session._fromObject(rawSession)

    if (session.completedAt) {
      database.exec('COMMIT')
      started = false
      return res.json(responseFor(session, true))
    }
    if (session.step !== 'SUMMARY') throw failure(409, 'SESSION_INCOMPLETE', 'The session has not reached the summary step.')
    if (!Object.hasOwn(rawSession, 'completedAt')) {
      session.completedAt = new Date()
      session.completionResult = { completedAt: session.completedAt.toISOString(), mode: session.mode || 'srs', legacyCompleted: true, summary: null }
      await session.save()
      database.exec('COMMIT')
      started = false
      return res.json(responseFor(session, false))
    }

    const attempts = await Attempt.find({ sessionId: session._id }).sort({ createdAt: 1 })
    const assessment = summarizeAttempts(session.wordIds, attempts)
    if (assessment.incompleteWordIds.length) throw failure(409, 'SESSION_INCOMPLETE', 'Each word needs a first attempt for all four assessment steps.')

    const now = new Date()
    const perWord = []
    for (const result of assessment.results) {
      const word = await Word.findById(result.wordId)
      if (!word) throw failure(409, 'SESSION_INCOMPLETE', 'A session word no longer exists.')
      const previousStage = Math.min(5, Math.max(0, Number(word.meta?.stage) || 0))
      let stage = previousStage
      let nextReviewDate = word.meta?.nextReviewDate ?? null
      if (session.mode === 'srs') {
        const update = nextSrsMeta(word.meta, result.outcome, now)
        stage = update.stage
        nextReviewDate = update.nextReviewDate.toISOString()
        word.meta = { ...word.meta, stage, difficulty: update.difficulty, nextReviewDate: update.nextReviewDate, lastSeenAt: now }
        await word.save()
      }
      perWord.push({ ...result, previousStage, stage, nextReviewDate })
    }
    const summary = {
      assessed: perWord.length,
      strong: perWord.filter((item) => item.outcome === 'strong').length,
      reinforce: perWord.filter((item) => item.outcome === 'reinforce').length,
      forgotten: perWord.filter((item) => item.outcome === 'forgotten').length,
      perWord,
    }
    session.completedAt = now
    session.completionResult = { completedAt: now.toISOString(), mode: session.mode, summary }
    await session.save()
    database.exec('COMMIT')
    started = false
    return res.json(responseFor(session, false))
  } catch (error) {
    if (started) database.exec('ROLLBACK')
    return res.status(error.status || 500).json({ error: error.message || 'Could not complete session.', code: error.code })
  }
}
