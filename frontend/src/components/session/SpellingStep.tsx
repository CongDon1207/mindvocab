// src/components/session/SpellingStep.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, AlertCircle, RotateCcw, Keyboard, Sparkles } from 'lucide-react'
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
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Summary Header */}
        <Card className="bg-violet-50/50 border-violet-100 rounded-[2rem] shadow-sm overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-2xl font-black text-violet-900 mb-2 tracking-tight">Kết quả Spelling</h3>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐIỂM SỐ</p>
                  <p className="text-2xl font-black text-violet-600">{totalCorrectInStep}/{totalWords}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SỐ VÒNG</p>
                  <p className="text-2xl font-black text-fuchsia-600">{roundNumber}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 gap-3">
          {finalSummary.sort((a) => (a.isCorrect ? 1 : -1)).map((result, idx) => (
            <div
              key={result.word._id}
              className={`p-5 rounded-2xl border transition-all bg-white/60 backdrop-blur-sm ${
                result.isCorrect
                  ? 'border-emerald-100'
                  : 'border-rose-100 shadow-rose-100/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${
                  result.isCorrect ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-800 font-bold truncate">
                    {result.word.word}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate">
                    {result.word.meaning_vi}
                  </div>
                </div>
                <div className={result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                  {result.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={notifyParentComplete} 
            className="min-w-[220px] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-xl shadow-violet-200 font-black uppercase tracking-widest text-xs py-6"
          >
            Tiếp tục hành trình
          </Button>
        </div>
      </div>
    )
  }

  // Hiển thị từ hiện tại
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Progress */}
      <div className="space-y-3 px-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            Vòng {roundNumber} • Từ {currentWordIndex + 1} / {totalWordsInRound}
          </span>
          <span className="text-violet-500">
            Đúng: {totalCorrectInStep} / {words.length}
          </span>
        </div>
        <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / totalWordsInRound) * 100}%` }}
          />
        </div>
      </div>

      {/* Round info */}
      {roundNumber > 1 && (
        <div className="text-center p-3 bg-amber-50/50 backdrop-blur-sm border border-amber-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-amber-700 font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <RotateCcw className="w-3 h-3" />
                ÔN TẬP LẠI {wrongWordsInRound.length} TỪ CHƯA ĐÚNG
            </p>
        </div>
      )}

      {/* Spelling card */}
      <Card className="rounded-[2.5rem] border-white bg-white/70 backdrop-blur-md shadow-xl shadow-violet-500/5 overflow-hidden">
        <CardContent className="p-10">
          <div className="space-y-8">
            {/* Prompt */}
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                Gõ từ tiếng Anh theo nghĩa
              </p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-snug">
                {currentWord.meaning_vi}
              </h2>
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-400 transition-colors">
                <Keyboard className="w-5 h-5" />
              </div>
              <Input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập từ..."
                disabled={isAnswered}
                className="text-center text-2xl font-bold py-8 px-12 bg-white/60 border-slate-100 rounded-2xl focus-visible:ring-violet-400 focus-visible:border-violet-300 transition-all shadow-inner"
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`p-5 rounded-2xl text-center animate-in zoom-in duration-300 border-2 ${
                feedback === 'correct'
                  ? 'bg-emerald-50/50 text-emerald-800 border-emerald-100'
                  : 'bg-rose-50/50 text-rose-800 border-rose-100'
              }`}>
                <div className="font-black text-sm uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  {feedback === 'correct' ? <><CheckCircle2 className="w-4 h-4" /> CHÍNH XÁC!</> : <><AlertCircle className="w-4 h-4" /> SAI MẤT RỒI</>}
                </div>
                {feedback === 'incorrect' && (
                  <div className="text-base font-bold">
                    Đáp án đúng: <span className="underline decoration-rose-300 decoration-2">{currentWord.word}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 justify-center pt-4">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!userInput.trim()}
                  className="min-w-[180px] rounded-xl bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all font-black uppercase tracking-widest text-xs py-6"
                >
                  Kiểm tra
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="min-w-[180px] rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:scale-105 shadow-xl shadow-violet-200 transition-all font-black uppercase tracking-widest text-xs py-6"
                >
                  {isLastWordInRound ? 'Tiếp tục' : 'Từ tiếp theo'}
                </Button>
              )}
            </div>

            {/* Keyboard hints */}
            <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Nhấn ENTER để {isAnswered ? 'tiếp tục' : 'kiểm tra'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SpellingStep
