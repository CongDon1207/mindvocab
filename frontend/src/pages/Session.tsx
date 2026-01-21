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
import { computeBatchProgress } from '@/lib/batch-utils'
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

  // ========== SERVER SYNC HELPERS ==========
  const syncSession = async (updates: any) => {
    if (!id) return
    try {
      await api.put(`/sessions/${id}`, updates)
      console.log('[SESSION] Synced with server:', updates)
    } catch (err) {
      console.error('[SESSION] Sync failed:', err)
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
        return flashcardsCompleted
      case 'QUIZ_PART1':
        return quizP1Completed
      case 'QUIZ_PART2':
        return quizP2Completed
      case 'SPELLING':
        return spellingCompleted
      case 'FILL_BLANK':
        return fillBlankCompleted
      case 'SUMMARY':
        return false
      default:
        return false
    }
  }

  const handleContinue = () => {
    // Nếu là bước cuối, cho phép quay lại folder
    if (isLastStep) {
      navigate(`/folders/${folderIdValue}`)
      return
    }

    if (!canProceedToNextStep()) return

    const currentIndex = getStepIndex(currentStep)
    if (currentIndex < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[currentIndex + 1]
      setCurrentStep(nextStep)
      if (id) {
        saveLocalState(id, nextStep)
        syncSession({ step: nextStep })
      }

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
      if (id) {
        saveLocalState(id, prevStep)
        syncSession({ step: prevStep })
      }
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
  
  // Logic fix: Ở bước cuối (Summary), nút Hoàn thành luôn được bật để người dùng thoát ra
  const continueEnabled = isLastStep || canProceedToNextStep()

  if (loading) return <SessionLoading />
  if (error) return <SessionError error={error} />
  if (!session) return null

  const folderIdValue = typeof session.folderId === 'string' ? session.folderId : session.folderId._id
  const folderName = session.folderName || (typeof session.folderId !== 'string' ? session.folderId.name : 'Folder')
  const folderStats = typeof session.folderId !== 'string' ? session.folderId.stats : undefined

  // Compute batch info for sequential mode
  const batchInfo = session.mode === 'sequential' && session.batchStartIndex !== undefined && folderStats?.totalWords
    ? computeBatchProgress(folderStats.totalWords, session.batchStartIndex)
    : undefined

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
        <SessionHeader
          folderName={folderName}
          stepLabel={STEP_LABELS[currentStep]}
          folderStats={folderStats}
          batchInfo={batchInfo}
          onBackToFolder={() => navigate(`/folders/${folderIdValue}`)}
        />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <SessionStepper
            steps={STEP_ORDER}
            stepLabels={STEP_LABELS}
            currentStepIndex={currentStepIndex}
            progressPercentage={progressPercentage}
          />
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-300">
          <SessionContent
            currentStep={currentStep}
            stepLabel={STEP_LABELS[currentStep]}
            session={session}
            onFlashcardsComplete={(completed: boolean) => setFlashcardsCompleted(completed)}
            onQuizP1Complete={(score: number, wrongIds: string[]) => {
              setQuizP1Completed(true)
              if (session) {
                const newWrongSet = Array.from(new Set([...session.wrongSet, ...wrongIds]))
                setSession({
                  ...session,
                  quizP1: { ...session.quizP1, score },
                  wrongSet: newWrongSet
                })
                syncSession({ 'quizP1.score': score, wrongSet: newWrongSet })
              }
            }}
            onQuizP2Complete={(score: number, wrongIds: string[]) => {
              setQuizP2Completed(true)
              if (session) {
                const newWrongSet = Array.from(new Set([...session.wrongSet, ...wrongIds]))
                setSession({
                  ...session,
                  quizP2: { ...session.quizP2, score },
                  wrongSet: newWrongSet
                })
                syncSession({ 'quizP2.score': score, wrongSet: newWrongSet })
              }
            }}
            onSpellingComplete={(correct: number, rounds: number) => {
              setSpellingCompleted(true)
              if (session) {
                setSession({
                  ...session,
                  spelling: { ...session.spelling, correct, rounds }
                })
                syncSession({
                  'spelling.correct': correct,
                  'spelling.rounds': rounds
                })
              }
            }}
            onFillBlankComplete={(score: number) => {
              setFillBlankCompleted(true)
              if (session) {
                setSession({
                  ...session,
                  fillBlank: { ...session.fillBlank, score }
                })
                syncSession({ 'fillBlank.score': score })
              }
            }}
          />
        </div>

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
