// src/pages/Session.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  SessionHeader,
  SessionStepper,
  SessionContent,
  SessionNavigation,
  SessionLoading,
  SessionError
} from '@/components/session'
import api from '@/lib/axios'
import type { Session, SessionStep, SessionLocalState } from '@/types/session'

const STEP_ORDER: SessionStep[] = [
  'FLASHCARDS',
  'QUIZ_PART1',
  'QUIZ_PART2',
  'SPELLING',
  'FILL_BLANK',
  'SUMMARY'
]

const STEP_LABELS: Record<SessionStep, string> = {
  FLASHCARDS: 'Flashcards',
  QUIZ_PART1: 'Quiz Part 1',
  QUIZ_PART2: 'Quiz Part 2',
  SPELLING: 'Spelling',
  FILL_BLANK: 'Fill in the Blank',
  SUMMARY: 'Summary'
}

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ========== STATE MANAGEMENT ==========
  const [session, setSession] = useState<Session | null>(null)
  const [currentStep, setCurrentStep] = useState<SessionStep>('FLASHCARDS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false)
  const [quizP1Completed, setQuizP1Completed] = useState(false)
  const [quizP2Completed, setQuizP2Completed] = useState(false)
  const [spellingCompleted, setSpellingCompleted] = useState(false)
  const [fillBlankCompleted, setFillBlankCompleted] = useState(false)

  // ========== LIFECYCLE ==========
  useEffect(() => {
    if (!id) return

    // Reset local progress flags khi chuyển sang session khác
    setCurrentStep('FLASHCARDS')
    setFlashcardsCompleted(false)
    setQuizP1Completed(false)
    setQuizP2Completed(false)
    setSpellingCompleted(false)
    setFillBlankCompleted(false)

    // Try to resume from localStorage
    const savedState = loadLocalState(id)
    if (savedState) {
      setCurrentStep(savedState.currentStep)
    }

    fetchSession()
    
    // Toast session start
    toast.success('Session bắt đầu!', {
      description: 'Chúc bạn học tập hiệu quả.'
    })
  }, [id])

  // ========== DATA FETCHING ==========
  const fetchSession = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.get<Session>(`/sessions/${id}`)
      setSession(res.data)
      
      // Sync with server step if no local state or server is ahead
      const savedState = loadLocalState(id)
      if (!savedState || getStepIndex(res.data.step) > getStepIndex(savedState.currentStep)) {
        setCurrentStep(res.data.step)
        saveLocalState(id, res.data.step)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải session.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ========== LOCAL STORAGE HELPERS ==========
  const loadLocalState = (sessionId: string): SessionLocalState | null => {
    try {
      const key = `mindvocab_session_${sessionId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  const saveLocalState = (sessionId: string, step: SessionStep) => {
    try {
      const key = `mindvocab_session_${sessionId}`
      const state: SessionLocalState = {
        sessionId,
        currentStep: step,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to save local state:', err)
    }
  }

  // ========== STATE MACHINE HELPERS ==========
  const getStepIndex = (step: SessionStep): number => {
    return STEP_ORDER.indexOf(step)
  }

  const canProceedToNextStep = (): boolean => {
    if (!session) return false

    switch (currentStep) {
      case 'FLASHCARDS':
        // Require viewing all cards at least once
        return flashcardsCompleted
      case 'QUIZ_PART1':
        // Require completing quiz part 1
        return quizP1Completed
      case 'QUIZ_PART2':
        // Require completing quiz part 2
        return quizP2Completed
      case 'SPELLING':
        // Require completing spelling (rounds >= maxRounds OR wrongSet empty)
        return spellingCompleted
      case 'FILL_BLANK':
        return fillBlankCompleted
      case 'SUMMARY':
        return false // Cannot proceed from summary
      default:
        return false
    }
  }

  const handleContinue = () => {
    if (!canProceedToNextStep()) return

    const currentIndex = getStepIndex(currentStep)
    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[currentIndex + 1]
      setCurrentStep(nextStep)
      if (id) saveLocalState(id, nextStep)
      
      // Toast step completion
      toast.success(`✅ Hoàn thành ${STEP_LABELS[currentStep]}!`, {
        description: `Chuyển sang ${STEP_LABELS[nextStep]}`
      })
    }
  }

  const handleBack = () => {
    const currentIndex = getStepIndex(currentStep)
    if (currentIndex > 0) {
      const prevStep = STEP_ORDER[currentIndex - 1]
      setCurrentStep(prevStep)
      if (id) saveLocalState(id, prevStep)
    }
  }

  const handleSkipSession = async () => {
    if (!id) return

    const toastId = toast.loading('Đang tạo session tiếp theo...')
    try {
      const res = await api.post<Session>('/sessions/next', { previousSessionId: id })
      const newSession = res.data

      toast.success('Tạo session mới thành công!', {
        id: toastId,
        description: 'Bắt đầu học 10 từ tiếp theo.'
      })

      // Chuyển hướng đến session mới
      navigate(`/sessions/${newSession._id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Không thể tạo session tiếp theo.', {
        id: toastId
      })
      console.error(err)
    }
  }

  // ========== COMPUTED VALUES ==========
  const currentStepIndex = getStepIndex(currentStep)
  const progressPercentage = Math.round(((currentStepIndex + 1) / STEP_ORDER.length) * 100)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1
  const continueEnabled = canProceedToNextStep() && !isLastStep

  // ========== RENDER ==========
  if (loading) return <SessionLoading />
  if (error) return <SessionError error={error} />

  if (!session) {
    return null
  }

  const folderIdValue =
    typeof session.folderId === 'string' ? session.folderId : session.folderId._id

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <SessionHeader
          folderName={session.folderName || session.folderId.name}
          stepLabel={STEP_LABELS[currentStep]}
          totalWords={session.totalWords || session.wordIds.length}
          progressPercentage={progressPercentage}
          onBackToFolder={() => navigate(`/folders/${folderIdValue}`)}
        />

        {/* Stepper */}
        <SessionStepper
          steps={STEP_ORDER}
          stepLabels={STEP_LABELS}
          currentStepIndex={currentStepIndex}
          progressPercentage={progressPercentage}
        />

        {/* Content Area */}
        <SessionContent
          currentStep={currentStep}
          stepLabel={STEP_LABELS[currentStep]}
          session={session}
          onFlashcardsComplete={(completed: boolean) => setFlashcardsCompleted(completed)}
          onQuizP1Complete={(score: number, wrongIds: string[]) => {
            setQuizP1Completed(true)
            // Update session state with new score
            if (session) {
              setSession({
                ...session,
                quizP1: { ...session.quizP1, score },
                wrongSet: Array.from(new Set([...session.wrongSet, ...wrongIds]))
              })
            }
          }}
          onQuizP2Complete={(score: number, wrongIds: string[]) => {
            setQuizP2Completed(true)
            // Update session state with new score
            if (session) {
              setSession({
                ...session,
                quizP2: { ...session.quizP2, score },
                wrongSet: Array.from(new Set([...session.wrongSet, ...wrongIds]))
              })
            }
          }}
          onSpellingComplete={(correct: number, rounds: number) => {
            setSpellingCompleted(true)
            // Update session state with spelling results
            if (session) {
              setSession({
                ...session,
                spelling: { ...session.spelling, correct, rounds }
              })
            }
          }}
          onFillBlankComplete={(score: number) => {
            setFillBlankCompleted(true)
            // Update session state with fill-blank score
            if (session) {
              setSession({
                ...session,
                fillBlank: { ...session.fillBlank, score }
              })
            }
          }}
        />

        {/* Navigation Controls */}
        <SessionNavigation
          currentStepIndex={currentStepIndex}
          totalSteps={STEP_ORDER.length}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          continueEnabled={continueEnabled}
          onBack={handleBack}
          onContinue={handleContinue}
          onSkip={handleSkipSession}
        />
      </div>
    </div>
  )
}

export default SessionPage
