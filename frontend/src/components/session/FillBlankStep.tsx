// src/components/session/FillBlankStep.tsx
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Sparkles, Wand2 } from 'lucide-react'
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
  const scrollInterval = useRef<number | null>(null)

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

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, word: string) => {
    if (isSubmitted) return
    e.dataTransfer.setData('text/plain', word)
    e.dataTransfer.effectAllowed = 'move'
    
    // Tạo ghost image mờ ảo một chút
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement
    ghost.style.opacity = '0.5'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (isSubmitted) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    // Tự động cuộn trang khi kéo sát mép
    const threshold = 120 // vùng nhạy cảm cuộn (pixel)
    const speed = 6 // tốc độ cuộn (giảm từ 15 xuống 6 cho mượt)
    const { clientY } = e
    const viewportHeight = window.innerHeight

    if (clientY < threshold) {
      window.scrollBy(0, -speed)
    } else if (clientY > viewportHeight - threshold) {
      window.scrollBy(0, speed)
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (isSubmitted) return
    e.preventDefault()
    const word = e.dataTransfer.getData('text/plain')
    
    // Nếu từ này đã được dùng ở ô khác, xóa nó ở ô cũ
    const oldIndex = isWordUsed(word)
    
    setAnswers(prev => {
      const newAnswers = { ...prev }
      if (oldIndex !== null) {
        delete newAnswers[oldIndex]
      }
      newAnswers[targetIndex] = word
      return newAnswers
    })
  }
  // -------------------------

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
      if (!isSubmitted) return 'bg-violet-100 border-violet-300 text-violet-700 shadow-sm scale-95'
      return results[usedIndex]
        ? 'bg-emerald-100 border-emerald-300 text-emerald-700 opacity-60'
        : 'bg-rose-100 border-rose-300 text-rose-700 opacity-60'
    }
    return isSubmitted
      ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-40'
      : 'bg-white/80 border-white text-slate-600 hover:bg-white hover:border-violet-200 hover:shadow-sm'
  }

  const getBlankStyle = (idx: number): string => {
    if (!isSubmitted) {
      return answers[idx] 
        ? 'bg-violet-50 border-violet-200 text-violet-800 shadow-inner' 
        : 'bg-slate-100/50 border-slate-200/50 text-slate-400'
    }
    return results[idx] 
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
      : 'bg-rose-50 border-rose-200 text-rose-800'
  }

  const renderSentence = (question: Question, idx: number) => {
    const parts = question.prompt.split('_____')
    const userAnswer = answers[idx]

    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3 text-lg leading-relaxed">
        <span className="text-slate-700 font-medium">{parts[0]}</span>
        <div className="relative inline-flex items-center">
          <div
            className={`min-w-[140px] px-4 py-1.5 border-2 rounded-xl text-center font-bold transition-all duration-300 ${getBlankStyle(idx)}`}
            onClick={() => !isSubmitted && handleClearAnswer(idx)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, idx)}
            style={{ cursor: isSubmitted ? 'default' : 'pointer' }}
          >
            {userAnswer || '...'}
          </div>
          {isSubmitted && !results[idx] && (
            <div className="ml-3 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-black border border-emerald-100 animate-in fade-in slide-in-from-left-2 duration-300">
              {question.answer}
            </div>
          )}
          {question.isInferred && !isSubmitted && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[8px] font-black uppercase text-violet-400">
              <Wand2 className="w-2.5 h-2.5" /> AI
            </div>
          )}
        </div>
        <span className="text-slate-700 font-medium">{parts[1] || ''}</span>
      </div>
    )
  }

  const filledCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const canSubmit = filledCount === totalQuestions && !isSubmitted

  return (
    <div className="space-y-8 animate-in fade-in duration-300" onDragOver={handleDragOver}>
      {/* Progress & Score */}
      <div className="space-y-3 px-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            {isSubmitted ? 'HOÀN THÀNH BÀI TẬP' : `ĐÃ ĐIỀN: ${filledCount} / ${totalQuestions}`}
          </span>
          {isSubmitted && (
            <span className={`flex items-center gap-2 ${score >= totalQuestions * 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
              <span className="font-black text-sm">{score}/{totalQuestions} CÂU ĐÚNG</span>
              {score >= totalQuestions * 0.7 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </span>
          )}
        </div>
        {!isSubmitted && (
           <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / totalQuestions) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Word Bank - Compact & Sticky */}
      <div className="sticky top-[90px] z-20 transition-all duration-300">
        <Card className="rounded-[1.5rem] border-white bg-white/70 backdrop-blur-xl shadow-lg border-2 border-violet-100/50 overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-500 rounded-lg shadow-sm">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ngân hàng từ</h3>
              </div>
              {!isSubmitted && (
                <span className="text-[9px] font-bold text-violet-400 animate-pulse">KÉO TỪ VÀO Ô TRỐNG</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {wordBank.map((word, idx) => {
                const usedIndex = isWordUsed(word)
                return (
                  <button
                    key={idx}
                    draggable={!isSubmitted}
                    onDragStart={(e) => handleDragStart(e, word)}
                    onClick={() => handleWordClick(word)}
                    disabled={isSubmitted}
                    className={`px-4 py-2 border-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 touch-none active:scale-95 ${getWordBankStyle(word)}`}
                  >
                    {word}
                    {usedIndex !== null && !isSubmitted && (
                      <span className="w-4 h-4 rounded-md bg-violet-500 text-white text-[9px] flex items-center justify-center font-black">
                        {usedIndex + 1}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions */}
      <Card className="rounded-[2rem] border-white bg-white/70 backdrop-blur-md shadow-xl shadow-violet-500/5 overflow-hidden">
        <CardContent className="p-8 md:p-10">
          <div className="space-y-6">
            {questions.map((question, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                  isSubmitted && !results[idx] 
                    ? 'bg-rose-50/50 border-rose-100 shadow-inner' 
                    : 'bg-white/40 border-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border mt-1 shadow-sm transition-colors ${
                    isSubmitted 
                      ? (results[idx] ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100')
                      : 'bg-white text-slate-400 border-slate-100'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-1.5">{renderSentence(question, idx)}</div>
                  {isSubmitted && (
                    <div className={results[idx] ? 'text-emerald-500 mt-2' : 'text-rose-500 mt-2'}>
                      {results[idx] ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit / Complete */}
      <div className="flex justify-center gap-3 pt-4">
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit} 
            className="min-w-[220px] rounded-xl bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-200 font-black uppercase tracking-widest text-xs py-6 transition-all disabled:opacity-30 disabled:shadow-none"
          >
            NỘP BÀI ({filledCount}/{totalQuestions})
          </Button>
        ) : (
          <Button 
            onClick={() => onComplete?.(score)} 
            className="min-w-[220px] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 shadow-xl shadow-violet-200 font-black uppercase tracking-widest text-xs py-6 transition-all"
          >
            HOÀN THÀNH BƯỚC NÀY
          </Button>
        )}
      </div>

      {!isSubmitted && (
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Điền đủ 10 câu để nộp bài nha!
        </p>
      )}
    </div>
  )
}

export default FillBlankStep
