// src/components/session/SessionContent.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { SessionStep, Session } from '@/types/session'
import type { Word } from '@/types/word'
import FlashcardStep from './FlashcardStep'
import QuizStep from './QuizStep'
import SpellingStep from './SpellingStep'
import FillBlankStep from './FillBlankStep'
import SummaryStep from './SummaryStep'

interface SessionContentProps {
  currentStep: SessionStep
  stepLabel: string
  session: Session
  onFlashcardsComplete?: (completed: boolean) => void
  onQuizP1Complete?: (score: number, wrongIds: string[]) => void
  onQuizP2Complete?: (score: number, wrongIds: string[]) => void
  onSpellingComplete?: (correct: number, rounds: number) => void
  onFillBlankComplete?: (score: number) => void
}

const SessionContent: React.FC<SessionContentProps> = ({
  currentStep,
  stepLabel,
  session,
  onFlashcardsComplete,
  onQuizP1Complete,
  onQuizP2Complete,
  onSpellingComplete,
  onFillBlankComplete
}) => {
  // Render content based on current step
  if (currentStep === 'FLASHCARDS') {
    const words = session.wordIds as unknown as Word[]
    
    return (
      <Card>
        <CardContent className="pt-6">
          <FlashcardStep 
            words={words} 
            onComplete={onFlashcardsComplete}
          />
        </CardContent>
      </Card>
    )
  }

  // Quiz Part 1: VN→EN
  if (currentStep === 'QUIZ_PART1') {
    return (
      <Card>
        <CardContent className="pt-6">
          <QuizStep
            sessionId={session._id}
            questions={session.quizP1.questions}
            stepType="QUIZ_PART1"
            onComplete={onQuizP1Complete}
          />
        </CardContent>
      </Card>
    )
  }

  // Quiz Part 2: EN→VI
  if (currentStep === 'QUIZ_PART2') {
    return (
      <Card>
        <CardContent className="pt-6">
          <QuizStep
            sessionId={session._id}
            questions={session.quizP2.questions}
            stepType="QUIZ_PART2"
            onComplete={onQuizP2Complete}
          />
        </CardContent>
      </Card>
    )
  }

  // Spelling: check wrongSet
  if (currentStep === 'SPELLING') {
    const words = session.wordIds as unknown as Word[]
    
    return (
      <Card>
        <CardContent className="pt-6">
          <SpellingStep
            sessionId={session._id}
            words={words}
            wrongSet={session.wrongSet}
            onComplete={onSpellingComplete}
          />
        </CardContent>
      </Card>
    )
  }

  // Fill in the Blank
  if (currentStep === 'FILL_BLANK') {
    return (
      <Card>
        <CardContent className="pt-6">
          <FillBlankStep
            sessionId={session._id}
            questions={session.fillBlank.questions}
            onComplete={onFillBlankComplete}
          />
        </CardContent>
      </Card>
    )
  }

  // Summary
  if (currentStep === 'SUMMARY') {
    return (
      <Card>
        <CardContent className="pt-6">
          <SummaryStep session={session} />
        </CardContent>
      </Card>
    )
  }

  // Placeholder for other steps
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {stepLabel}
          </h2>
          <p className="text-gray-600 mb-6">
            Nội dung bài học sẽ được hiển thị ở đây trong Phase tiếp theo.
          </p>
          <div className="text-sm text-gray-500">
            <p>Session ID: {session._id}</p>
            <p>Seed: {session.seed}</p>
            <p>Step: {currentStep}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionContent
