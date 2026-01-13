// src/components/session/QuizStep.tsx
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import api from '@/lib/axios'
import type { Question } from '@/types/session'

interface QuizStepProps {
  sessionId: string
  questions: Question[]
  stepType: 'QUIZ_PART1' | 'QUIZ_PART2'
  onComplete?: (score: number, wrongWordIds: string[]) => void
}

const QuizStep: React.FC<QuizStepProps> = ({
  sessionId,
  questions,
  stepType,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  // Reset currentQuestionIndex when stepType changes (QUIZ_PART1 -> QUIZ_PART2)
  useEffect(() => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setWrongWordIds([])
  }, [stepType])

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null)
    setIsAnswered(false)
    setFeedback(null)
  }, [currentQuestionIndex])

  // Keyboard shortcuts: 1-4 to select, Enter to submit/next
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter') {
          handleNext()
        }
        return
      }

      // Select options with 1-4 keys
      const optionIndex = parseInt(e.key) - 1
      if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
        setSelectedAnswer(currentQuestion.options[optionIndex])
      }

      // Submit with Enter key
      if (e.key === 'Enter' && selectedAnswer) {
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAnswered, selectedAnswer, currentQuestion])

  // Submit answer
  const handleSubmit = async () => {
    if (!selectedAnswer || isAnswered) return

    const isCorrect = selectedAnswer === currentQuestion.answer
    setIsAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1)
      toast.success('✅ Chính xác!')
    } else {
      setWrongWordIds(prev => [...prev, currentQuestion.wordId])
      toast.error('❌ Chưa đúng', {
        description: `Đáp án đúng: ${currentQuestion.answer}`
      })
    }

    // Log attempt to backend
    try {
      await api.post('/attempts', {
        sessionId,
        step: stepType,
        wordId: currentQuestion.wordId,
        userAnswer: selectedAnswer,
        isCorrect
      })
    } catch (err) {
      console.error('Failed to log attempt:', err)
      toast.error('Lỗi lưu dữ liệu')
    }
  }

  // Skip current question (count as incorrect)
  const handleSkip = async () => {
    if (isAnswered) return

    setIsAnswered(true)
    setFeedback('incorrect')
    setWrongWordIds(prev => [...prev, currentQuestion.wordId])

    // Log skip as incorrect attempt
    try {
      await api.post('/attempts', {
        sessionId,
        step: stepType,
        wordId: currentQuestion.wordId,
        userAnswer: '',
        isCorrect: false
      })
    } catch (err) {
      console.error('Failed to log skip:', err)
    }
  }

  // Move to next question
  const handleNext = () => {
    if (!isAnswered) return

    if (isLastQuestion) {
      // Quiz completed
      handleComplete()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Complete quiz and update session
  const handleComplete = async () => {
    const finalScore = score
    const uniqueWrongIds = Array.from(new Set(wrongWordIds))

    // Update session on backend
    try {
      const scoreField = stepType === 'QUIZ_PART1' ? 'quizP1.score' : 'quizP2.score'
      await api.put(`/sessions/${sessionId}`, {
        [scoreField]: finalScore,
        wrongSet: uniqueWrongIds
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }

    // Notify parent
    if (onComplete) {
      onComplete(finalScore, uniqueWrongIds)
    }
  }

  // Option button style
  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return option === selectedAnswer
        ? 'bg-violet-50 border-violet-400 text-violet-900 shadow-md scale-[1.02]'
        : 'bg-white/60 border-white/60 text-slate-600 hover:bg-white hover:border-violet-200'
    }

    // After answered: show correct/incorrect
    if (option === currentQuestion.answer) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
    }
    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm'
    }
    return 'bg-white/40 border-white/20 text-slate-300 opacity-60'
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3 px-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            Câu {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-violet-500 font-black">
            Đúng: {score} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card className="rounded-[2rem] border-white bg-white/70 backdrop-blur-md shadow-xl shadow-violet-500/5 overflow-hidden">
        <CardContent className="p-10">
          <div className="space-y-8">
            {/* Question prompt */}
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {stepType === 'QUIZ_PART1' ? 'Chọn từ tiếng Anh phù hợp' : 'Chọn nghĩa tiếng Việt phù hợp'}
              </p>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-snug">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full p-5 text-left border-2 rounded-2xl transition-all duration-300 font-bold group ${getOptionStyle(option)}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition-colors ${
                      option === selectedAnswer ? 'bg-violet-500 border-violet-400 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:border-violet-200'
                    }`}>
                      {optionLabels[idx]}
                    </span>
                    <span className="text-base">{option}</span>
                    {isAnswered && option === currentQuestion.answer && (
                      <span className="ml-auto text-emerald-500"><CheckCircle2 className="w-5 h-5" /></span>
                    )}
                    {isAnswered && option === selectedAnswer && option !== currentQuestion.answer && (
                      <span className="ml-auto text-rose-500"><AlertCircle className="w-5 h-5" /></span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center pt-4">
              {!isAnswered ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="rounded-xl text-slate-400 hover:text-slate-600"
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="min-w-[160px] rounded-xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all font-black uppercase tracking-widest text-xs"
                  >
                    Xác nhận
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  className="min-w-[180px] rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:scale-105 shadow-xl shadow-violet-200 transition-all font-black uppercase tracking-widest text-xs"
                >
                  {isLastQuestion ? 'Xem kết quả' : 'Tiếp theo'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizStep
