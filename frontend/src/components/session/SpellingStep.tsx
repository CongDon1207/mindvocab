// src/components/session/SpellingStep.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/axios'
import type { Word } from '@/types/word'

interface SpellingStepProps {
  sessionId: string
  words: Word[]
  wrongSet: string[]
  onComplete?: (correct: number, rounds: number) => void
}

const SpellingStep: React.FC<SpellingStepProps> = ({
  sessionId,
  words,
  wrongSet,
  onComplete
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([])
  const [allResults, setAllResults] = useState<Array<{ word: Word; userAnswer: string; isCorrect: boolean }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = words[currentWordIndex]
  const totalWords = words.length
  const isLastWord = currentWordIndex === totalWords - 1

  // Reset khi chuyển từ
  useEffect(() => {
    setUserInput('')
    setIsAnswered(false)
    setFeedback(null)
    inputRef.current?.focus()
  }, [currentWordIndex])

  // Keyboard: Enter để submit/next
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isAnswered) {
          handleNext()
        } else if (userInput.trim()) {
          handleSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAnswered, userInput, currentWordIndex])

  // Chuẩn hoá text: trim, lowercase
  const normalizeText = (text: string): string => {
    return text.trim().toLowerCase()
  }

  // Submit answer
  const handleSubmit = async () => {
    if (!userInput.trim() || isAnswered || !currentWord) return

    const normalizedInput = normalizeText(userInput)
    const normalizedAnswer = normalizeText(currentWord.word)
    const isCorrect = normalizedInput === normalizedAnswer

    setIsAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    // Update stats
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    } else {
      setWrongWordIds(prev => [...prev, currentWord._id])
    }

    // Lưu kết quả để hiển thị summary cuối cùng
    setAllResults(prev => [...prev, {
      word: currentWord,
      userAnswer: userInput.trim(),
      isCorrect
    }])

    // Log attempt
    try {
      await api.post('/attempts', {
        sessionId,
        step: 'SPELLING',
        wordId: currentWord._id,
        userAnswer: userInput.trim(),
        isCorrect
      })
    } catch (err) {
      console.error('Failed to log spelling attempt:', err)
    }
  }

  // Next word or complete
  const handleNext = () => {
    if (!isAnswered) return

    if (isLastWord) {
      handleComplete()
    } else {
      setCurrentWordIndex(prev => prev + 1)
    }
  }

  // Complete spelling
  const handleComplete = async () => {
    const uniqueWrongIds = Array.from(new Set([...wrongSet, ...wrongWordIds]))

    // Update session
    try {
      await api.put(`/sessions/${sessionId}`, {
        'spelling.rounds': 1,
        'spelling.correct': correctCount,
        wrongSet: uniqueWrongIds
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }

    // Notify parent
    if (onComplete) {
      onComplete(correctCount, 1)
    }
  }

  // Nếu đã hoàn thành, hiển thị summary
  if (isAnswered && isLastWord && allResults.length === totalWords) {
    return (
      <div className="space-y-6">
        {/* Summary Header */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Kết quả Spelling</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Điểm: <span className="font-bold">{correctCount}/{totalWords}</span></p>
                <p>Tỷ lệ đúng: <span className="font-bold">{Math.round((correctCount / totalWords) * 100)}%</span></p>
                {correctCount < totalWords && (
                  <p className="text-orange-700 mt-2">
                    Các từ sai đã được thêm vào wrongSet để ôn tập
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Chi tiết từng từ</h3>
            <div className="space-y-3">
              {allResults.map((result, idx) => (
                <div
                  key={result.word._id}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="font-semibold text-gray-500 min-w-6">{idx + 1}.</div>
                    <div className="flex-1 space-y-1">
                      <div className="text-gray-900 font-medium">
                        {result.word.meaning_vi}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Bạn trả lời: </span>
                        <span className={result.isCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                          {result.userAnswer || '(bỏ trống)'}
                        </span>
                      </div>
                      {!result.isCorrect && (
                        <div className="text-sm">
                          <span className="text-gray-600">Đáp án đúng: </span>
                          <span className="text-green-700 font-semibold">{result.word.word}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xl">
                      {result.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="flex justify-center">
          <Button onClick={() => onComplete?.(correctCount, 1)} size="lg" className="min-w-[200px]">
            Hoàn thành
          </Button>
        </div>
      </div>
    )
  }

  // Hiển thị từ hiện tại
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Từ {currentWordIndex + 1} / {totalWords}
        </span>
        <span>
          Đúng: {correctCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / totalWords) * 100}%` }}
        />
      </div>

      {/* Spelling card */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Prompt */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Gõ từ tiếng Anh theo nghĩa:
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentWord.meaning_vi}
              </h2>
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto">
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập từ tiếng Anh..."
                disabled={isAnswered}
                className="text-center text-lg py-6"
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-4 rounded-lg text-center ${
                feedback === 'correct'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="font-medium mb-1">
                  {feedback === 'correct' ? '✓ Chính xác!' : '✗ Sai rồi'}
                </div>
                {feedback === 'incorrect' && (
                  <div className="text-sm">
                    Đáp án đúng: <span className="font-bold">{currentWord.word}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="min-w-[120px]"
                >
                  Kiểm tra
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="min-w-[120px]"
                >
                  {isLastWord ? 'Xem kết quả' : 'Từ tiếp theo'}
                </Button>
              )}
            </div>

            {/* Keyboard hints */}
            <div className="text-center text-sm text-gray-500">
              Phím tắt: Enter để {isAnswered ? 'tiếp tục' : 'kiểm tra'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SpellingStep
