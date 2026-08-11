import { createModel } from './sqliteModel.js'

const emptyQuiz = () => ({ questions: [], score: 0 })
const Session = createModel('sessions', (data = {}) => ({
  ...data,
  wordIds: data.wordIds || [],
  step: data.step || 'FLASHCARDS',
  mode: data.mode || 'srs',
  wrongSet: data.wrongSet || [],
  reviewNotes: data.reviewNotes || [],
  quizP1: { ...emptyQuiz(), ...(data.quizP1 || {}) },
  quizP2: { ...emptyQuiz(), ...(data.quizP2 || {}) },
  spelling: { rounds: 0, correct: 0, maxRounds: 3, ...(data.spelling || {}) },
  fillBlank: { ...emptyQuiz(), ...(data.fillBlank || {}) },
  seed: data.seed ?? Math.floor(Math.random() * 1e9),
  batchStartIndex: data.batchStartIndex ?? 0,
}))

export default Session
