// src/components/session/FlashcardStep.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RotateCw, Star } from 'lucide-react'
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
      <div className="space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex-1 text-base font-medium text-gray-900 leading-relaxed">{ex.en}</p>
          {ex.source === 'inferred' && (
            <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
              Inferred
            </span>
          )}
        </div>
        {ex.vi && (
          <p className="text-sm text-gray-600 italic leading-relaxed">{ex.vi}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Thẻ {currentIndex + 1} / {totalCards}
        </span>
        <span>
          Đã xem: {viewedCards.size} / {totalCards}
        </span>
      </div>

      {/* Flashcard */}
      <div className="relative h-[420px]" style={{ perspective: '1200px' }}>
        <div 
          className="cursor-pointer relative h-full w-full"
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s'
          }}
        >
          {/* Front side - Word info */}
          <Card 
            className="absolute inset-0 h-full"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div className="space-y-6 text-center">
                <div className="flex justify-between items-start">
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkDifficult()
                    }}
                    className={isDifficult ? 'text-yellow-500' : 'text-gray-400'}
                  >
                    <Star className={`h-5 w-5 ${isDifficult ? 'fill-yellow-500' : ''}`} />
                  </Button>
                </div>

                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    {currentWord.word}
                  </h2>
                  {currentWord.ipa && (
                    <p className="text-lg text-gray-600 mb-2">/{currentWord.ipa}/</p>
                  )}
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {currentWord.pos}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <RotateCw className="h-5 w-5" />
                  <span className="text-sm">Nhấp để lật thẻ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back side - Meaning and examples */}
          <Card 
            className="absolute inset-0 h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <CardContent className="flex h-full flex-col p-8">
              <div className="flex-1 space-y-5 overflow-y-auto pr-2 min-h-0">
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                      Nghĩa tiếng Việt
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                    {currentWord.meaning_vi}
                  </h3>
                </div>

                {(currentWord.ex1 || currentWord.ex2) && (
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Ví dụ minh hoạ
                    </h4>
                    <div className="space-y-3">
                      {renderExample(currentWord.ex1)}
                    {currentWord.ex2 && currentWord.ex2.en && (
                        renderExample(currentWord.ex2)
                    )}
                    </div>
                  </div>
                )}

                {currentWord.note && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                      Ghi chú
                    </h4>
                    <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {currentWord.note}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-400 pt-4">
                <RotateCw className="h-5 w-5" />
                <span className="text-sm">Nhấp để lật lại</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Trước
        </Button>

        <div className="flex gap-1">
          {words.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setIsFlipped(false)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-blue-600 w-4'
                  : viewedCards.has(idx)
                  ? 'bg-blue-300'
                  : 'bg-gray-300'
              }`}
              aria-label={`Chuyển đến thẻ ${idx + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
        >
          Sau
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion message */}
      {canContinue && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">
            ✓ Bạn đã xem hết {totalCards} thẻ! Nhấn "Tiếp tục" để chuyển sang bước tiếp theo.
          </p>
        </div>
      )}
    </div>
  )
}

export default FlashcardStep
