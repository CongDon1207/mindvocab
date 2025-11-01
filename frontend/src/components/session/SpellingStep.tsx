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
  // State cho toàn bộ step
  const [allWrongWordIdsInStep, setAllWrongWordIdsInStep] = useState<string[]>([])
  const [totalCorrectInStep, setTotalCorrectInStep] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [isStepComplete, setIsStepComplete] = useState(false)
  const [finalSummary, setFinalSummary] = useState<Array<{ word: Word; isCorrect: boolean }>>([])

  // State cho mỗi vòng
  const [wordsToSpell, setWordsToSpell] = useState<Word[]>(words)
  const [wrongWordsInRound, setWrongWordsInRound] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const currentWord = wordsToSpell[currentWordIndex]
  const totalWordsInRound = wordsToSpell.length
  const isLastWordInRound = currentWordIndex === totalWordsInRound - 1

  // Reset khi chuyển từ
  useEffect(() => {
    setUserInput('')
    setIsAnswered(false)
    setFeedback(null)
  }, [currentWordIndex, roundNumber])

  // Focus input khi từ mới được hiển thị
  useEffect(() => {
    if (!isAnswered) {
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [currentWordIndex, isAnswered, roundNumber])

  // Keyboard: Enter để submit/next
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (isAnswered) {
          handleNext()
        } else if (userInput.trim()) {
          handleSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isAnswered, userInput, currentWordIndex, roundNumber])

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
      // Chỉ tăng điểm nếu đây là lần đầu trả lời đúng từ này trong cả step
      if (!finalSummary.some(res => res.word._id === currentWord._id && res.isCorrect)) {
        setTotalCorrectInStep(prev => prev + 1)
      }
    } else {
      // Thêm vào danh sách sai của vòng này
      setWrongWordsInRound(prev => [...prev, currentWord])
      // Thêm vào danh sách tổng các từ đã từng sai (chỉ ID)
      setAllWrongWordIdsInStep(prev => Array.from(new Set([...prev, currentWord._id])))
    }

    // Cập nhật kết quả cuối cùng cho summary (chỉ lưu kết quả lần đầu)
    if (roundNumber === 1) {
        setFinalSummary(prev => [...prev, {
        word: currentWord,
        isCorrect
      }])
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

    // focus back vào ô nhập
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Chuyển từ tiếp theo hoặc kết thúc vòng
  const handleNext = () => {
    if (!isAnswered) return

    if (isLastWordInRound) {
      // Kết thúc vòng, kiểm tra xem có cần vòng mới không
      if (wrongWordsInRound.length > 0) {
        // Bắt đầu vòng mới với các từ sai
        setWordsToSpell(wrongWordsInRound)
        setWrongWordsInRound([])
        setCurrentWordIndex(0)
        setRoundNumber(prev => prev + 1)
      } else {
        // Hoàn thành tất cả các từ
        handleCompleteStep()
      }
    } else {
      // Từ tiếp theo trong vòng
      setCurrentWordIndex(prev => prev + 1)
    }
  }

  // Hoàn thành toàn bộ step
  const handleCompleteStep = async () => {
    setIsStepComplete(true)
    const uniqueWrongIds = Array.from(new Set([...wrongSet, ...allWrongWordIdsInStep]))

    // Update session
    try {
      await api.put(`/sessions/${sessionId}`, {
        'spelling.rounds': roundNumber,
        'spelling.correct': totalCorrectInStep,
        wrongSet: uniqueWrongIds
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }
  }

  // Báo cho component cha là đã xong
  const notifyParentComplete = () => {
    if (onComplete) {
      onComplete(totalCorrectInStep, roundNumber)
    }
  }

  // Nếu đã hoàn thành, hiển thị summary
  if (isStepComplete) {
    const totalWords = words.length
    return (
      <div className="space-y-6">
        {/* Summary Header */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Kết quả Spelling</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Điểm: <span className="font-bold">{totalCorrectInStep}/{totalWords}</span></p>
                <p>Tỷ lệ đúng (lần đầu): <span className="font-bold">{Math.round((totalCorrectInStep / totalWords) * 100)}%</span></p>
                <p>Số vòng: <span className="font-bold">{roundNumber}</span></p>
                {totalCorrectInStep < totalWords && (
                  <p className="text-orange-700 mt-2">
                    Các từ sai đã được thêm vào wrongSet để ôn tập
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results (based on first attempt) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Chi tiết kết quả lần đầu</h3>
            <div className="space-y-3">
              {finalSummary.sort((a) => (a.isCorrect ? 1 : -1)).map((result, idx) => (
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
                        {result.word.word} ({result.word.meaning_vi})
                      </div>
                      <div className="text-sm">
                        <span className={`font-semibold ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {result.isCorrect ? 'Trả lời đúng' : 'Trả lời sai lần đầu'}
                        </span>
                      </div>
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
          <Button onClick={notifyParentComplete} size="lg" className="min-w-[200px]">
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
          Vòng {roundNumber} | Từ {currentWordIndex + 1} / {totalWordsInRound}
        </span>
        <span>
          Điểm: {totalCorrectInStep} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / totalWordsInRound) * 100}%` }}
        />
      </div>

      {/* Round info */}
      {roundNumber > 1 && (
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
                Ôn tập lại các từ sai ({wrongWordsInRound.length} từ còn lại)
            </p>
        </div>
      )}

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
                  {isLastWordInRound ? 'Tiếp tục' : 'Từ tiếp theo'}
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
