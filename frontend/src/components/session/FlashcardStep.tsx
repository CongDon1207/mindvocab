// src/components/session/FlashcardStep.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RotateCw, Sparkles, Star, Volume2 } from 'lucide-react'
import type { Word } from '@/types/word'

interface FlashcardStepProps {
  words: Word[]
  onComplete?: (completed: boolean) => void
}

const FlashcardStep: React.FC<FlashcardStepProps> = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set())
  const [markedDifficult, setMarkedDifficult] = useState<Set<number>>(new Set())

  const currentWord = words[currentIndex]
  const totalCards = words.length

  // Mark current card as viewed
  useEffect(() => {
    setViewedCards(prev => new Set(prev).add(currentIndex))
  }, [currentIndex])

  const handleSpeak = (lang: 'en-US' | 'en-GB', e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel() // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = lang
    utterance.rate = 0.9

    // Try to find a specific voice for the language
    const voices = window.speechSynthesis.getVoices()
    const matchingVoices = voices.filter(v =>
      v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase()
    )

    if (matchingVoices.length > 0) {
      // Prioritize Google voices if available as they usually sound better
      const googleVoice = matchingVoices.find(v => v.name.includes('Google'))
      utterance.voice = googleVoice || matchingVoices[0]
    }

    window.speechSynthesis.speak(utterance)
  }

  // Check if all cards viewed at least once
  const allCardsViewed = viewedCards.size === totalCards
  const canContinue = allCardsViewed

  // Notify parent when completion status changes
  useEffect(() => {
    if (onComplete) {
      onComplete(allCardsViewed)
    }
  }, [allCardsViewed, onComplete])

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(prev => !prev)
  }

  const handleMarkDifficult = () => {
    setMarkedDifficult(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex)
      } else {
        newSet.add(currentIndex)
      }
      return newSet
    })
  }

  const isDifficult = markedDifficult.has(currentIndex)

  // Render example with [Inferred] badge
  const renderExample = (ex?: { en: string; vi: string; source?: 'user' | 'inferred' }) => {
    if (!ex || !ex.en) return null

    return (
      <div className="space-y-2 rounded-2xl bg-white/50 p-5 border border-white shadow-sm hover:bg-white/80 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 text-base font-bold text-slate-700 leading-relaxed">{ex.en}</p>
          {ex.source === 'inferred' && (
            <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter bg-violet-100 text-violet-600 border border-violet-200">
              AI MAGIC
            </span>
          )}
        </div>
        {ex.vi && (
          <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{ex.vi}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Thẻ {currentIndex + 1} / {totalCards}
        </span>
        <span className="flex items-center gap-1.5">
          Đã xem {viewedCards.size}
          <div className="h-1 w-20 bg-slate-200 rounded-full overflow-hidden inline-block">
            <div className="h-full bg-violet-400" style={{ width: `${(viewedCards.size / totalCards) * 100}%` }} />
          </div>
        </span>
      </div>

      {/* Flashcard */}
      <div className="relative h-[480px]" style={{ perspective: '2000px' }}>
        <div
          className="cursor-pointer relative h-full w-full"
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Front side - Word info */}
          <Card
            className="absolute inset-0 h-full rounded-[3rem] border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-violet-500/5 overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
            
            <CardContent className="flex h-full flex-col justify-between p-10 relative z-10">
              <div className="space-y-10 text-center">
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSpeak('en-US', e)}
                      className="h-10 px-4 text-[10px] font-black tracking-widest border-sky-100 text-sky-600 bg-sky-50/50 hover:bg-sky-100 hover:border-sky-200 transition-all rounded-2xl shadow-sm uppercase"
                    >
                      <Volume2 className="h-4 w-4 mr-1.5" />
                      US
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSpeak('en-GB', e)}
                      className="h-10 px-4 text-[10px] font-black tracking-widest border-pink-100 text-pink-600 bg-pink-50/50 hover:bg-pink-100 hover:border-pink-200 transition-all rounded-2xl shadow-sm uppercase"
                    >
                      <Volume2 className="h-4 w-4 mr-1.5" />
                      UK
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkDifficult()
                    }}
                    className={`h-10 w-10 rounded-2xl ${isDifficult ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:bg-slate-50'}`}
                  >
                    <Star className={`h-5 w-5 ${isDifficult ? 'fill-amber-500' : ''}`} />
                  </Button>
                </div>

                <div className="pt-8">
                  <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">
                    {currentWord.word}
                  </h2>
                  {currentWord.ipa && (
                    <p className="text-xl text-violet-500 font-mono font-bold mb-4 tracking-widest">/{currentWord.ipa}/</p>
                  )}
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white">
                    {currentWord.pos}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 text-slate-300 animate-bounce duration-[2000ms]">
                  <RotateCw className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nhấp để lật</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back side - Meaning and examples */}
          <Card
            className="absolute inset-0 h-full rounded-[3rem] border-white/60 bg-white shadow-2xl shadow-fuchsia-500/5 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Background pattern */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

            <CardContent className="flex h-full flex-col p-10 relative z-10">
              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-400">
                    NGHĨA TIẾNG VIỆT
                  </p>
                  <h3 className="text-4xl font-black text-slate-800 leading-tight">
                    {currentWord.meaning_vi}
                  </h3>
                </div>

                {(currentWord.ex1 || currentWord.ex2) && (
                  <div className="space-y-4 pt-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">VÍ DỤ NGỮ CẢNH</p>
                    <div className="space-y-3">
                      {renderExample(currentWord.ex1)}
                      {currentWord.ex2 && currentWord.ex2.en && (
                        renderExample(currentWord.ex2)
                      )}
                    </div>
                  </div>
                )}

                {currentWord.note && (
                  <div className="pt-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-3">GHI CHÚ</p>
                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-dashed border-slate-200">
                      <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                        {currentWord.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-300 pt-6">
                <RotateCw className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lật lại</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-2">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-2xl hover:bg-white/60 text-slate-400 hover:text-violet-600"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="font-bold">TRƯỚC</span>
        </Button>

        <div className="flex gap-2 items-center">
          {words.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setIsFlipped(false)
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex
                ? 'bg-violet-500 w-8 shadow-[0_0_8px_rgba(167,139,250,0.5)]'
                : viewedCards.has(idx)
                  ? 'bg-violet-200 w-2.5'
                  : 'bg-slate-200 w-1.5'
                }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="rounded-2xl hover:bg-white/60 text-slate-400 hover:text-violet-600"
        >
          <span className="font-bold">SAU</span>
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Completion message */}
      {canContinue && (
        <div className="bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 rounded-[2rem] p-6 text-center shadow-sm animate-in zoom-in duration-500">
          <p className="text-emerald-700 font-black text-sm tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            TUYỆT VỜI! BẠN ĐÃ XEM HẾT CÁC THẺ. NHẤN "TIẾP TỤC" NHA!
          </p>
        </div>
      )}
    </div>
  )
}

export default FlashcardStep
