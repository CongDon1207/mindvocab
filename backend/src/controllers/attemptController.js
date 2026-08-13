import Attempt from '../model/Attempt.js'
import Session from '../model/Session.js'

export async function createAttempt(req, res) {
  try {
    const { sessionId, step, wordId, userAnswer, isCorrect } = req.body || {}
    if (!sessionId || !step || !wordId) return res.status(400).json({ error: 'sessionId, step, and wordId are required.' })
    const session = await Session.findById(sessionId)
    if (!session) return res.status(404).json({ error: 'Session not found.' })
    if (!session.wordIds.some((id) => String(id) === String(wordId))) return res.status(400).json({ error: 'wordId is not in this session.' })
    const attempt = await Attempt.create({ sessionId, step, wordId, userAnswer: userAnswer ?? '', isCorrect: Boolean(isCorrect) })
    return res.status(201).json(attempt)
  } catch (error) {
    return res.status(500).json({ error: 'Could not save attempt.', detail: error.message })
  }
}

export async function getSessionAttempts(req, res) {
  try {
    if (!await Session.findById(req.params.id)) return res.status(404).json({ error: 'Session not found.' })
    const query = { sessionId: req.params.id }
    if (req.query.step) query.step = req.query.step
    const attempts = await Attempt.find(query).populate('wordId', 'word meaning_vi').sort({ createdAt: 1 })
    return res.json({ sessionId: req.params.id, step: req.query.step || 'all', total: attempts.length, attempts })
  } catch (error) {
    return res.status(500).json({ error: 'Could not get attempts.', detail: error.message })
  }
}
