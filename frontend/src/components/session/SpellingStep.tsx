// src/components/session/SpellingStep.tsx
import React, { useState, useEffect } from 'react'
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
  const [currentRound, setCurrentRound] = useState(1)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongWords, setWrongWords] = useState<string[]>([])

  const maxRounds = 3

  // Khởi tạo wrongSet từ Quiz P1+P2
  useEffect(() => {
    if (wrongSet && wrongSet.length > 0) {
      setWrongWords(wrongSet)
    }
  }, [])

  // Lấy danh sách từ cần kiểm tra (round 1 = wrongSet, round 2+ = wrongWords còn sai)
  const wordsToSpell = currentRound === 1 && wrongSet.length > 0
    ? words.filter(w => wrongSet.includes(w._id))
    : words.filter(w => wrongWords.includes(w._id))

  const currentWord = wordsToSpell[currentWordIndex]
  const totalWords = wordsToSpell.length
  const isLastWord = currentWordIndex === totalWords - 1

  // Reset khi chuyển từ
  useEffect(() => {
    setUserInput('')
    setIsAnswered(false)
    setFeedback(null)
  }, [currentWordIndex, currentRound])

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
  }, [isAnswered, userInput])

  // Chuẩn hoá text: trim, lowercase, bỏ khoảng trắng thừa
  const normalizeText = (text: string): string => {
    return text.trim().toLowerCase().replace(/\s+/g, ' ')
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
      // Xoá từ khỏi wrongWords nếu đúng
      setWrongWords(prev => prev.filter(id => id !== currentWord._id))
    } else {
      // Thêm vào wrongWords nếu sai (cho round tiếp theo)
      setWrongWords(prev => {
        if (!prev.includes(currentWord._id)) {
          return [...prev, currentWord._id]
        }
        return prev
      })
    }

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

  // Next word or round
  const handleNext = () => {
    if (!isAnswered) return

    if (isLastWord) {
      // Kiểm tra điều kiện kết thúc
      if (wrongWords.length === 0 || currentRound >= maxRounds) {
        handleComplete()
      } else {
        // Chuyển sang round tiếp theo
        setCurrentRound(prev => prev + 1)
        setCurrentWordIndex(0)
      }
    } else {
      setCurrentWordIndex(prev => prev + 1)
    }
  }

  // Complete spelling
  const handleComplete = async () => {
    // Update session
    try {
      await api.put(`/sessions/${sessionId}`, {
        'spelling.rounds': currentRound,
        'spelling.correct': correctCount,
        wrongSet: wrongWords
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }

    // Notify parent
    if (onComplete) {
      onComplete(correctCount, currentRound)
    }
  }

  // Gợi ý: số ký tự đúng vị trí (optional hint)
  const getHint = (): string => {
    if (!currentWord || !userInput.trim() || !isAnswered) return ''

    const normalizedInput = normalizeText(userInput)
    const normalizedAnswer = normalizeText(currentWord.word)
    
    let correctPositions = 0
    const minLength = Math.min(normalizedInput.length, normalizedAnswer.length)
    
    for (let i = 0; i < minLength; i++) {
      if (normalizedInput[i] === normalizedAnswer[i]) {
        correctPositions++
      }
    }

    return `${correctPositions}/${normalizedAnswer.length} ký tự đúng vị trí`
  }

  // Kiểm tra xem còn từ để kiểm tra không
  if (wordsToSpell.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hoàn thành!
        </h2>
        <p className="text-gray-600 mb-6">
          Bạn đã trả lời đúng tất cả các từ trong Quiz. Không có từ nào cần kiểm tra chính tả.
        </p>
        <Button onClick={() => onComplete?.(0, 0)}>
          Tiếp tục
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Vòng {currentRound} / {maxRounds} • Từ {currentWordIndex + 1} / {totalWords}
        </span>
        <span>
          Đúng: {correctCount}
        </span>
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
              {currentWord.ipa && (
                <p className="text-sm text-gray-500 mt-2">
                  /{currentWord.ipa}/
                </p>
              )}
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập từ tiếng Anh..."
                disabled={isAnswered}
                className="text-center text-lg py-6"
                autoFocus
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
                  <div className="space-y-1">
                    <div className="text-sm">
                      Đáp án đúng: <span className="font-bold">{currentWord.word}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {getHint()}
                    </div>
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
                  {isLastWord && (wrongWords.length === 0 || currentRound >= maxRounds)
                    ? 'Hoàn thành'
                    : isLastWord
                    ? `Vòng tiếp theo (${currentRound + 1}/${maxRounds})`
                    : 'Từ tiếp theo'}
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

      {/* Round info */}
      {currentRound > 1 && (
        <div className="text-center text-sm text-gray-600">
          <p>Đang lặp lại các từ sai trong vòng {currentRound}</p>
        </div>
      )}
    </div>
  )
}

export default SpellingStep
