// src/types/word.ts

export type Word = {
  _id: string
  folderId: string
  word: string
  pos: string // noun, verb, adj, adv, etc.
  meaning_vi: string
  ipa?: string
  note?: string
  ex1?: {
    en: string
    vi: string
    source: 'user' | 'inferred'
  }
  ex2?: {
    en: string
    vi: string
    source: 'user' | 'inferred'
  }
  tags?: string[]
  meta?: {
    difficulty?: number
    stage?: number
    nextReviewDate?: string | Date
    lastSeenAt?: Date
    createdBy?: string
  }
  createdAt: string
  updatedAt: string
}

export type WordFormValues = {
  word: string
  pos: string
  meaning_vi: string
  ipa?: string
  note?: string
  ex1_en?: string
  ex1_vi?: string
  ex2_en?: string
  ex2_vi?: string
}

export type GetWordsResponse = {
  words: Word[]
  total: number
  skip: number
  limit: number
}
