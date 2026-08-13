import Session from '../model/Session.js'
import Word from '../model/Word.js'
import Folder from '../model/Folder.js'
import { generateAllQuestions } from '../utils/questionGenerator.js'
import { buildProgress, selectSrsWords } from '../services/srsService.js'
import { isCompleteWord } from '../utils/wordContent.js'

const STEP_ORDER = ['FLASHCARDS', 'QUIZ_PART1', 'QUIZ_PART2', 'SPELLING', 'FILL_BLANK', 'SUMMARY']
const MODES = new Set(['srs', 'sequential', 'retry'])

async function getUniqueFolderWords(folderId) {
  const words = await Word.find({ folderId }).sort({ word: 1, createdAt: 1 })
  const unique = new Map()
  for (const word of words) {
    const key = word.word.toLowerCase().trim()
    if (!unique.has(key)) unique.set(key, word)
  }
  return [...unique.values()]
}

function sameIds(left, right) {
  return left.length === right.length && left.every((id, index) => String(id) === String(right[index]))
}

async function recentMatchingSession(folderId, mode, wordIds, sequenceAction = null) {
  const recent = await Session.find({ folderId, mode, createdAt: { $gte: new Date(Date.now() - 5000) } })
  return recent.find((session) => sameIds(session.wordIds || [], wordIds) && (session.sequenceAction || null) === sequenceAction)
}

async function createStoredSession({ folderId, mode, wordIds, batchStartIndex = 0, selectionSummary = null, sequenceAction = null }) {
  const words = await Word.find({ _id: { $in: wordIds } })
  const incompleteWordIds = words.filter((word) => !isCompleteWord(word)).map((word) => word._id)
  if (incompleteWordIds.length) {
    const error = new Error('Words must include two examples and a Fill Blank sentence.')
    error.code = 'WORDS_INCOMPLETE'; error.wordIds = incompleteWordIds
    throw error
  }
  const existing = await recentMatchingSession(folderId, mode, wordIds, sequenceAction)
  if (existing) return { session: existing, reused: true }
  const session = new Session({
    folderId, wordIds, mode, batchStartIndex, selectionSummary, sequenceAction, isRetry: mode === 'retry',
    step: 'FLASHCARDS', wrongSet: [], reviewNotes: [],
    quizP1: { questions: [], score: 0 }, quizP2: { questions: [], score: 0 },
    spelling: { rounds: 0, correct: 0, maxRounds: 3 }, fillBlank: { questions: [], score: 0 },
    seed: Math.floor(Math.random() * 1e9), completedAt: null, completionResult: null,
  })
  await session.save()
  return { session, reused: false }
}

async function createSequentialSession(folderId, action = 'continue', startOffset) {
  const unfinished = await Session.findOne({ folderId, mode: 'sequential', completedAt: null }).sort({ createdAt: -1 })
  if (action === 'continue' && unfinished) return { session: unfinished, reused: true }
  const words = await getUniqueFolderWords(folderId)
  const latest = await Session.findOne({ folderId, mode: 'sequential', completedAt: { $ne: null } }).sort({ createdAt: -1 })
  const offset = action === 'restart' ? 0 : (startOffset ?? ((latest?.batchStartIndex || 0) + (latest?.wordIds?.length || 0)))
  if (offset >= words.length) return { exhausted: true, totalWords: words.length }
  return createStoredSession({ folderId, mode: 'sequential', wordIds: words.slice(offset, offset + 10).map((word) => word._id), batchStartIndex: offset, sequenceAction: action })
}

export async function createSession(req, res) {
  try {
    const { folderId, mode = 'srs', sequenceAction = 'continue', startOffset, wordIds } = req.body || {}
    if (!folderId) return res.status(400).json({ error: 'folderId is required.' })
    if (!MODES.has(mode)) return res.status(400).json({ error: 'mode must be srs, sequential, or retry.' })
    if (!await Folder.findById(folderId)) return res.status(404).json({ error: 'Folder not found.' })

    if (mode === 'sequential') {
      if (!['continue', 'restart'].includes(sequenceAction)) return res.status(400).json({ error: 'sequenceAction must be continue or restart.' })
      const result = await createSequentialSession(folderId, sequenceAction, Number.isInteger(startOffset) ? startOffset : undefined)
      if (result.exhausted) return res.status(409).json({ code: 'SEQUENCE_COMPLETE', error: 'All words in this folder have been reviewed.', totalWords: result.totalWords })
      return res.status(result.reused ? 200 : 201).json(result.session)
    }

    if (mode === 'retry') {
      if (!Array.isArray(wordIds) || wordIds.length === 0 || wordIds.length > 10) return res.status(400).json({ error: 'wordIds must contain between 1 and 10 words.' })
      const uniqueIds = [...new Set(wordIds.map(String))]
      if (uniqueIds.length !== wordIds.length) return res.status(400).json({ error: 'wordIds must be unique.' })
      const validWords = await Word.find({ folderId, _id: { $in: uniqueIds } })
      if (validWords.length !== uniqueIds.length) return res.status(400).json({ error: 'Every retry word must belong to this folder.' })
      const result = await createStoredSession({ folderId, mode, wordIds: uniqueIds })
      return res.status(result.reused ? 200 : 201).json(result.session)
    }

    const selected = selectSrsWords(await Word.find({ folderId }), new Date())
    if (!selected.words.length) return res.status(409).json({ code: 'NOTHING_DUE', error: 'No words are due for study today.' })
    const result = await createStoredSession({ folderId, mode, wordIds: selected.words.map((word) => word._id), selectionSummary: selected.selectionSummary })
    return res.status(result.reused ? 200 : 201).json(result.session)
  } catch (error) {
    if (error.code === 'WORDS_INCOMPLETE') return res.status(409).json({ code: error.code, error: error.message, wordIds: error.wordIds })
    return res.status(500).json({ error: 'Could not create session.', detail: error.message })
  }
}

export async function createNextSession(req, res) {
  try {
    const previous = await Session.findById(req.body?.previousSessionId)
    if (!previous) return res.status(404).json({ error: 'Previous session not found.' })
    if (previous.mode !== 'sequential') return res.status(409).json({ code: 'MODE_NOT_SEQUENTIAL', error: 'Only sequential sessions can continue to the next batch.' })
    const result = await createSequentialSession(previous.folderId, 'continue', previous.batchStartIndex + previous.wordIds.length)
    if (result.exhausted) return res.status(409).json({ code: 'SEQUENCE_COMPLETE', error: 'All words in this folder have been reviewed.' })
    return res.status(result.reused ? 200 : 201).json(result.session)
  } catch (error) {
    return res.status(500).json({ error: 'Could not create the next session.', detail: error.message })
  }
}

export async function getSession(req, res) {
  try {
    const session = await Session.findById(req.params.id).populate('folderId', 'name description').populate('wordIds', 'word pos meaning_vi ipa note ex1 ex2 fillExample meta')
    if (!session) return res.status(404).json({ error: 'Session not found.' })
    const words = session.wordIds.filter(Boolean)
    const incompleteWordIds = words.filter((word) => !isCompleteWord(word)).map((word) => word._id)
    if (incompleteWordIds.length) return res.status(409).json({ code: 'WORDS_INCOMPLETE', error: 'Words must include two examples and a Fill Blank sentence.', wordIds: incompleteWordIds })
    if (!session.quizP1.questions?.length || !session.quizP2.questions?.length || !session.fillBlank.questions?.length) {
      const questions = await generateAllQuestions(session, words)
      session.quizP1.questions = questions.quizP1
      session.quizP2.questions = questions.quizP2
      session.fillBlank.questions = questions.fillBlank
      await session.save()
    }
    const folderWords = await Word.find({ folderId: session.folderId?._id || session.folderId })
    const value = session.toObject()
    if (value.folderId) value.folderId.stats = buildProgress(folderWords)
    return res.json({ ...value, folderName: session.folderId?.name || 'Unknown Folder', totalWords: words.length })
  } catch (error) {
    return res.status(500).json({ error: 'Could not get session.', detail: error.message })
  }
}

export async function updateSession(req, res) {
  try {
    const session = await Session.findById(req.params.id)
    if (!session) return res.status(404).json({ error: 'Session not found.' })
    const updates = req.body || {}
    if (updates.step) {
      const current = STEP_ORDER.indexOf(session.step)
      const next = STEP_ORDER.indexOf(updates.step)
      if (next < current || next > current + 1) return res.status(400).json({ error: 'Session steps must advance one step at a time.' })
      session.step = updates.step
    }
    if (Array.isArray(updates.wrongSet)) session.wrongSet = [...new Set([...session.wrongSet.map(String), ...updates.wrongSet.map(String)])]
    if (Array.isArray(updates.reviewNotes)) session.reviewNotes = updates.reviewNotes
    for (const [field, value] of Object.entries(updates)) {
      const [parent, child] = field.split('.')
      if (['quizP1.score', 'quizP2.score', 'spelling.rounds', 'spelling.correct', 'fillBlank.score'].includes(field)) session[parent][child] = value
    }
    await session.save()
    return res.json(session)
  } catch (error) {
    return res.status(500).json({ error: 'Could not update session.', detail: error.message })
  }
}
