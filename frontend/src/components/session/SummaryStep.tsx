// src/components/session/SummaryStep.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Home } from 'lucide-react'
import api from '@/lib/axios'
import type { Session } from '@/types/session'
import type { Word } from '@/types/word'

interface SummaryStepProps {
  session: Session
}

const SummaryStep: React.FC<SummaryStepProps> = ({ session }) => {
  const navigate = useNavigate()
  const words = session.wordIds as unknown as Word[]
  const [isStartingNext, setIsStartingNext] = useState(false)
  const [hasNextBatch, setHasNextBatch] = useState(true)

  // Tính điểm tổng
  const quizP1Score = session.quizP1.score
  const quizP2Score = session.quizP2.score
  const spellingCorrect = session.spelling.correct
  const fillBlankScore = session.fillBlank.score

  const totalQuizQuestions = 20 // P1 + P2
  const totalQuizScore = quizP1Score + quizP2Score
  const quizPercentage = Math.round((totalQuizScore / totalQuizQuestions) * 100)

  const totalFillQuestions = session.fillBlank.questions.length
  const fillPercentage = totalFillQuestions > 0 
    ? Math.round((fillBlankScore / totalFillQuestions) * 100) 
    : 0

  const spellingRounds = session.spelling.rounds

  // Lấy danh sách từ sai cuối cùng
  const wrongWords = words.filter(w => session.wrongSet.includes(w._id))

  // Badge [Inferred] cho nội dung sinh bởi AI
  const inferredQuestionsCount = session.fillBlank.questions.filter(q => q.isInferred).length

  // Gọi API cập nhật mastery khi component mount
  useEffect(() => {
    const updateMastery = async () => {
      try {
        await api.post(`/sessions/${session._id}/complete`)
        console.log('[SUMMARY] Mastery updated successfully')
      } catch (err) {
        console.error('[SUMMARY] Failed to update mastery:', err)
      }
    }

    updateMastery()
  }, [session._id])

  const handleRetryWrong = () => {
    if (wrongWords.length === 0) {
      alert('Không có từ sai để ôn tập!')
      return
    }

    // Tạo session mới từ wrongSet
    navigate(`/folders/${session.folderId._id}`, { 
      state: { retryWords: session.wrongSet } 
    })
  }

  const handleFinish = () => {
    navigate(`/folders/${session.folderId._id}`)
  }

  const handleStartNext = async () => {
    if (isStartingNext || !hasNextBatch) return

    setIsStartingNext(true)

    try {
      const res = await api.post(`/sessions/next`, {
        previousSessionId: session._id
      })
      navigate(`/sessions/${res.data._id}`)
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Không thể tạo session tiếp theo.'
      alert(message)

      if (err?.response?.status === 400 && message.includes('Đã học hết')) {
        setHasNextBatch(false)
      }
    } finally {
      setIsStartingNext(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Hoàn thành session!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quiz Summary */}
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Quiz (Part 1 + Part 2)</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalQuizScore}/{totalQuizQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{quizPercentage}%</p>
              <p className="text-sm text-gray-500">
                P1: {quizP1Score}/10 | P2: {quizP2Score}/10
              </p>
            </div>
          </div>

          {/* Spelling Summary */}
          <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Spelling</p>
              <p className="text-2xl font-bold text-purple-600">
                {spellingCorrect} từ đúng
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {spellingRounds}/{session.spelling.maxRounds} vòng
              </p>
            </div>
          </div>

          {/* Fill Blank Summary */}
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Fill in the Blank</p>
              <p className="text-2xl font-bold text-green-600">
                {fillBlankScore}/{totalFillQuestions}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">{fillPercentage}%</p>
              {inferredQuestionsCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    Inferred
                  </span>
                  {` ${inferredQuestionsCount} câu`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wrong Words Review */}
      {wrongWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Từ cần ôn lại ({wrongWords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wrongWords.map((word, idx) => (
                <div
                  key={word._id}
                  className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {idx + 1}. {word.word}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({word.pos})
                      </span>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{word.meaning_vi}</p>
                    {word.note && (
                      <p className="text-xs text-gray-500 italic mt-1">{word.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-center">
            {!session.isRetry && (
              <Button
                onClick={handleStartNext}
                className="flex items-center gap-2"
                disabled={isStartingNext || !hasNextBatch}
              >
                <RefreshCcw className="w-4 h-4" />
                {hasNextBatch ? (isStartingNext ? 'Đang tạo...' : 'Học 10 từ kế tiếp') : 'Không còn từ mới'}
              </Button>
            )}
            {wrongWords.length > 0 && (
              <Button
                onClick={handleRetryWrong}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <RefreshCcw className="w-4 h-4" />
                Ôn lại từ sai ({wrongWords.length})
              </Button>
            )}
            <Button
              onClick={handleFinish}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Home className="w-4 h-4" />
              Kết thúc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insight */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhận xét</CardTitle>
        </CardHeader>
        <CardContent>
          {quizPercentage >= 80 && wrongWords.length === 0 ? (
            <p className="text-sm text-green-700">
              🎉 Xuất sắc! Bạn đã nắm vững tất cả các từ trong session này.
            </p>
          ) : quizPercentage >= 80 ? (
            <p className="text-sm text-blue-700">
              👍 Làm tốt lắm! Hãy ôn lại {wrongWords.length} từ còn sai để đạt mức mastered.
            </p>
          ) : quizPercentage >= 60 ? (
            <p className="text-sm text-orange-700">
              📚 Khá tốt! Bạn cần ôn lại {wrongWords.length} từ để cải thiện độ thành thạo.
            </p>
          ) : (
            <p className="text-sm text-red-700">
              💪 Cần cố gắng hơn! Hãy ôn lại từ sai và thử lại session này.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SummaryStep
