export const SRS_INTERVALS = [0, 3, 7, 14, 30, 90]
export const ASSESSMENT_STEPS = ['QUIZ_PART1', 'QUIZ_PART2', 'SPELLING', 'FILL_BLANK']

export function startOfDay(date = new Date()) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function startOfTomorrow(date = new Date()) {
  const result = startOfDay(date)
  result.setDate(result.getDate() + 1)
  return result
}

export function reviewDateForStage(stage, now = new Date()) {
  const result = startOfDay(now)
  result.setDate(result.getDate() + (SRS_INTERVALS[stage] ?? SRS_INTERVALS[1]))
  return result
}

function validDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

function sortByDateThenCreated(left, right) {
  const leftDate = validDate(left.meta?.nextReviewDate)?.getTime() ?? 0
  const rightDate = validDate(right.meta?.nextReviewDate)?.getTime() ?? 0
  return leftDate - rightDate || new Date(left.createdAt || 0) - new Date(right.createdAt || 0)
}

export function selectSrsWords(words, now = new Date(), size = 10) {
  const today = startOfDay(now)
  const tomorrow = startOfTomorrow(now)
  const overdue = []
  const dueToday = []
  const newWords = []

  for (const word of words) {
    const lastSeenAt = word.meta?.lastSeenAt
    const nextReviewDate = validDate(word.meta?.nextReviewDate)
    if (!lastSeenAt) {
      newWords.push(word)
    } else if (nextReviewDate && nextReviewDate < today) {
      overdue.push(word)
    } else if (nextReviewDate && nextReviewDate < tomorrow) {
      dueToday.push(word)
    }
  }

  overdue.sort(sortByDateThenCreated)
  dueToday.sort(sortByDateThenCreated)
  newWords.sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0))
  const dueWords = [...overdue, ...dueToday]
  const selected = [...dueWords.slice(0, size), ...newWords.slice(0, Math.max(0, size - dueWords.length))]
  return {
    words: selected,
    selectionSummary: { dueCount: Math.min(dueWords.length, size), newCount: Math.max(0, selected.length - Math.min(dueWords.length, size)) },
  }
}

export function classifyResult(correct, total) {
  if (correct >= Math.max(3, total - 1)) return 'strong'
  if (correct === 2) return 'reinforce'
  return 'forgotten'
}

export function nextSrsMeta(meta = {}, outcome, now = new Date()) {
  const previousStage = Math.min(5, Math.max(0, Number(meta.stage) || 0))
  const difficulty = Math.min(4, Math.max(0, Number(meta.difficulty) || 0))
  if (outcome === 'strong') {
    const stage = Math.min(5, previousStage + 1)
    return { previousStage, stage, difficulty: Math.max(0, difficulty - 1), nextReviewDate: reviewDateForStage(stage, now) }
  }
  const stage = outcome === 'forgotten' ? Math.max(0, previousStage - 1) : previousStage
  return { previousStage, stage, difficulty: Math.min(4, difficulty + 1), nextReviewDate: startOfTomorrow(now) }
}

export function summarizeAttempts(wordIds, attempts) {
  const firstAttempts = new Map(wordIds.map((id) => [String(id), new Map()]))
  for (const attempt of attempts) {
    const byStep = firstAttempts.get(String(attempt.wordId))
    if (byStep && ASSESSMENT_STEPS.includes(attempt.step) && !byStep.has(attempt.step)) {
      byStep.set(attempt.step, Boolean(attempt.isCorrect))
    }
  }
  const incompleteWordIds = []
  const results = wordIds.map((wordId) => {
    const byStep = firstAttempts.get(String(wordId)) || new Map()
    if (byStep.size !== ASSESSMENT_STEPS.length) incompleteWordIds.push(String(wordId))
    const correct = [...byStep.values()].filter(Boolean).length
    return { wordId: String(wordId), correct, total: ASSESSMENT_STEPS.length, outcome: classifyResult(correct, ASSESSMENT_STEPS.length) }
  })
  return { results, incompleteWordIds }
}

export function buildProgress(words, now = new Date()) {
  const tomorrow = startOfTomorrow(now)
  const progress = { totalWords: words.length, learned: 0, learning: 0, strong: 0, mastered: 0, dueToday: 0, stageDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  for (const word of words) {
    const stage = Math.min(5, Math.max(0, Number(word.meta?.stage) || 0))
    progress.stageDistribution[stage] += 1
    if (!word.meta?.lastSeenAt) continue
    progress.learned += 1
    if (stage <= 3) progress.learning += 1
    else if (stage === 4) progress.strong += 1
    else progress.mastered += 1
    const reviewDate = validDate(word.meta?.nextReviewDate)
    if (reviewDate && reviewDate < tomorrow) progress.dueToday += 1
  }
  return progress
}
