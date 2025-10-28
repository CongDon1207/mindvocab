// src/components/session/QuizStep.tsx
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        ? 'bg-blue-100 border-blue-500 text-blue-900'
        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
    }

    // After answered: show correct/incorrect
    if (option === currentQuestion.answer) {
      return 'bg-green-100 border-green-500 text-green-900'
    }
    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return 'bg-red-100 border-red-500 text-red-900'
    }
    return 'bg-white border-gray-300 text-gray-400'
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Câu {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span>
            Điểm: {score} / {totalQuestions}
          </span>
        </div>
        {/* Visual progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Question prompt */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                {stepType === 'QUIZ_PART1' ? 'Chọn từ tiếng Anh phù hợp:' : 'Chọn nghĩa tiếng Việt phù hợp:'}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${getOptionStyle(option)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg min-w-8">
                      {optionLabels[idx]}.
                    </span>
                    <span className="font-medium">{option}</span>
                    {isAnswered && option === currentQuestion.answer && (
                      <span className="ml-auto text-green-600 font-bold">✓</span>
                    )}
                    {isAnswered && option === selectedAnswer && option !== currentQuestion.answer && (
                      <span className="ml-auto text-red-600 font-bold">✗</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-4 rounded-lg text-center font-medium ${
                feedback === 'correct'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {feedback === 'correct' ? '✓ Chính xác!' : `✗ Sai rồi. Đáp án đúng: ${currentQuestion.answer}`}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              {!isAnswered ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                  >
                    Bỏ qua (Skip)
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="min-w-[120px]"
                  >
                    Trả lời
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  className="min-w-[120px]"
                >
                  {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
                </Button>
              )}
            </div>

            {/* Keyboard hints */}
            <div className="text-center text-sm text-gray-500">
              {!isAnswered ? (
                <p>Phím tắt: 1-4 để chọn, Enter để trả lời</p>
              ) : (
                <p>Phím tắt: Enter để tiếp tục</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizStep
