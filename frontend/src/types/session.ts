// src/types/session.ts
import type { Word } from './word'

export type SessionStep =
  | 'FLASHCARDS'
  | 'QUIZ_PART1'
  | 'QUIZ_PART2'
  | 'SPELLING'
  | 'FILL_BLANK'
  | 'SUMMARY'

export type SessionProgress = {
  current: SessionStep
  completed: SessionStep[]
  percentage: number
}

export type Question = {
  type: 'VN2EN' | 'EN2VI' | 'SPELLING' | 'FILL'
  wordId: string
  prompt: string
  options: string[]
  answer: string
  bank: string[]
}

export type SessionMode = 'srs' | 'sequential' | 'retry'

export type Session = {
  _id: string
  folderId: {
    _id: string
    name: string
    description?: string
    stats?: {
      totalWords: number
      learned?: number
      learning?: number
      strong?: number
      mastered: number
      dueToday?: number
    }
  }
  wordIds: Word[] | string[]  // Can be populated or just IDs
  step: SessionStep
  mode: SessionMode
  isRetry: boolean
  completedAt?: string | null
  selectionSummary?: { dueCount: number; newCount: number } | null
  completionResult?: CompletionResult | null
  wrongSet: string[]
  reviewNotes: string[]
  quizP1: {
    questions: Question[]
    score: number
  }
  quizP2: {
    questions: Question[]
    score: number
  }
  spelling: {
    rounds: number
    correct: number
    maxRounds: number
  }
  fillBlank: {
    questions: Question[]
    score: number
  }
  seed: number
  batchStartIndex?: number // Sequential mode: vị trí batch trong folder (0, 10, 20...)
  createdAt: string
  updatedAt: string
  folderName?: string
  totalWords?: number
}

export type CompletionResult = {
  alreadyCompleted?: boolean
  completedAt: string
  mode: SessionMode
  legacyCompleted?: boolean
  summary: {
    assessed: number
    strong: number
    reinforce: number
    forgotten: number
    perWord: Array<{ wordId: string; correct: number; total: number; outcome: 'strong' | 'reinforce' | 'forgotten'; previousStage: number; stage: number; nextReviewDate: string | null }>
  } | null
}

export type SessionLocalState = {
  sessionId: string
  currentStep: SessionStep
  lastUpdated: string
}
