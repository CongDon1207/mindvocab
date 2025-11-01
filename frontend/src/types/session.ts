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
  isInferred?: boolean
}

export type Session = {
  _id: string
  folderId: {
    _id: string
    name: string
    description?: string
  }
  wordIds: Word[] | string[]  // Can be populated or just IDs
  step: SessionStep
  isRetry: boolean
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
  createdAt: string
  updatedAt: string
  // Enriched fields from backend
  folderName?: string
  totalWords?: number
}

export type SessionLocalState = {
  sessionId: string
  currentStep: SessionStep
  lastUpdated: string
}
