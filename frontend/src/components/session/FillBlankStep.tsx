// src/components/session/FillBlankStep.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import type { Question } from '@/types/session'
import { isFlexibleMatch } from '@/lib/string-utils'

interface FillBlankStepProps {
  sessionId: string
  questions: Question[]
  onComplete?: (score: number) => void
}

const FillBlankStep: React.FC<FillBlankStepProps> = ({
  sessionId,
  questions,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState<Record<number, boolean>>({})

  const wordBank = questions[0]?.bank || []

  useEffect(() => {
    setAnswers({})
    setIsSubmitted(false)
    setScore(0)
    setResults({})
  }, [questions])

  const isWordUsed = (word: string): number | null => {
    for (const [idx, answer] of Object.entries(answers)) {
      if (answer === word) return parseInt(idx)
    }
    return null
  }

  const handleWordClick = (word: string) => {
    if (isSubmitted) return
    const usedIndex = isWordUsed(word)

    if (usedIndex !== null) {
      // Clear if already used
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[usedIndex]
        return newAnswers
      })
    } else {
      // Fill first empty blank
      const firstUnfilled = questions.findIndex((_, i) => !answers[i])
      if (firstUnfilled !== -1) {
        setAnswers(prev => ({ ...prev, [firstUnfilled]: word }))
      }
    }
  }

  const handleClearAnswer = (questionIndex: number) => {
    if (isSubmitted) return
    setAnswers(prev => {
      const newAnswers = { ...prev }
      delete newAnswers[questionIndex]
      return newAnswers
    })
  }

  const handleSubmit = async () => {
    if (isSubmitted) return

    let correctCount = 0
    const newResults: Record<number, boolean> = {}

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx] || ''
      const isCorrect = isFlexibleMatch(userAnswer, q.answer)
      newResults[idx] = isCorrect
      if (isCorrect) correctCount++
    })

    setResults(newResults)
    setScore(correctCount)
    setIsSubmitted(true)

    try {
      await Promise.all([
        ...questions.map((q, idx) =>
          api.post('/attempts', {
            sessionId,
            step: 'FILL_BLANK',
            wordId: q.wordId,
            userAnswer: answers[idx] || '',
            isCorrect: newResults[idx]
          })
        ),
        api.put(`/sessions/${sessionId}`, { 'fillBlank.score': correctCount })
      ])
    } catch (err) {
      console.error('Failed to save fill-blank results:', err)
    }
  }

  const getWordBankStyle = (word: string): string => {
    const usedIndex = isWordUsed(word)
    if (usedIndex !== null) {
      if (!isSubmitted) return 'bg-blue-100 border-blue-300 text-blue-700 cursor-pointer hover:bg-blue-200'
      return results[usedIndex]
        ? 'bg-green-100 border-green-300 text-green-700 cursor-default'
        : 'bg-red-100 border-red-300 text-red-700 cursor-default'
    }
    return isSubmitted
      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 cursor-pointer'
  }

  const getBlankStyle = (idx: number): string => {
    if (!isSubmitted) {
      return answers[idx] ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-gray-50 border-gray-300 text-gray-400'
    }
    return results[idx] ? 'bg-green-50 border-green-300 text-green-900' : 'bg-red-50 border-red-300 text-red-900'
  }

  const renderSentence = (question: Question, idx: number) => {
    const parts = question.prompt.split('_____')
    const userAnswer = answers[idx]

    return (
      <div className="flex flex-wrap items-center gap-2 text-lg">
        <span className="text-gray-800">{parts[0]}</span>
        <div className="relative inline-flex items-center">
          <div
            className={`min-w-[120px] px-4 py-2 border-2 rounded-lg text-center font-medium transition-all ${getBlankStyle(idx)}`}
            onClick={() => !isSubmitted && handleClearAnswer(idx)}
            style={{ cursor: isSubmitted ? 'default' : 'pointer' }}
            title={isSubmitted ? '' : 'Click để xoá'}
          >
            {userAnswer || '______'}
          </div>
          {isSubmitted && !results[idx] && (
            <div className="ml-2 text-sm text-green-700 font-semibold">→ {question.answer}</div>
          )}
          {question.isInferred && !isSubmitted && (
            <div className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">[Inferred]</div>
          )}
        </div>
        <span className="text-gray-800">{parts[1] || ''}</span>
      </div>
    )
  }

  const filledCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const canSubmit = filledCount === totalQuestions && !isSubmitted

  return (
    <div className="space-y-6">
      {/* Progress & Score */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {isSubmitted ? `Điểm: ${score} / ${totalQuestions}` : `Đã điền: ${filledCount} / ${totalQuestions}`}
        </span>
        {isSubmitted && (
          <span className={score >= totalQuestions * 0.7 ? 'text-green-600 font-semibold' : 'text-orange-600'}>
            {score >= totalQuestions * 0.7 ? '✓ Đạt' : '○ Cần cải thiện'}
          </span>
        )}
      </div>

      {/* Word Bank */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Word Bank (10 từ)</h3>
            <p className="text-xs text-gray-500 mb-3">
              {isSubmitted ? 'Các từ đã dùng' : 'Click vào từ để điền vào chỗ trống'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word, idx) => {
              const usedIndex = isWordUsed(word)
              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  disabled={isSubmitted}
                  className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${getWordBankStyle(word)}`}
                >
                  {word}
                  {usedIndex !== null && !isSubmitted && <span className="ml-2 text-xs opacity-70">({usedIndex + 1})</span>}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Điền từ vào chỗ trống (10 câu)</h3>
            {questions.map((question, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-all ${isSubmitted && !results[idx] ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="font-semibold text-gray-500 min-w-6">{idx + 1}.</div>
                  <div className="flex-1">{renderSentence(question, idx)}</div>
                  {isSubmitted && <div className="text-xl">{results[idx] ? '✓' : '✗'}</div>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit / Complete */}
      <div className="flex justify-center gap-3">
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="min-w-[200px]">
            Submit ({filledCount}/{totalQuestions})
          </Button>
        ) : (
          <Button onClick={() => onComplete?.(score)} size="lg" className="min-w-[200px]">
            Hoàn thành
          </Button>
        )}
      </div>

      {/* Instructions or Result */}
      {!isSubmitted ? (
        <div className="text-center text-sm text-gray-500">
          <p>Điền tất cả 10 câu trước khi Submit. Click vào chỗ trống để xoá từ đã điền.</p>
        </div>
      ) : (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Kết quả Fill-in-the-blank</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Điểm: <span className="font-bold">{score}/{totalQuestions}</span></p>
                <p>Tỷ lệ đúng: <span className="font-bold">{Math.round((score / totalQuestions) * 100)}%</span></p>
                {score < totalQuestions && (
                  <p className="text-orange-700 mt-2">Các câu sai đã được highlight màu đỏ phía trên</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FillBlankStep
