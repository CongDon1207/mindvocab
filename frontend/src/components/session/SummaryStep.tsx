// src/components/session/SummaryStep.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Home, Calendar } from 'lucide-react'
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

  // SRS Intervals helper
  const getNextReviewLabel = (word: Word) => {
    const stage = word.meta?.stage || 0
    const intervals = ['Hôm nay', '3 ngày tới', '1 tuần tới', '2 tuần tới', '1 tháng tới', 'Đã thuộc lòng']
    return intervals[stage] || '3 ngày tới'
  }

  const totalWords = words.length

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Hoàn thành session!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quiz Summary */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Quiz</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-700">{quizPercentage}%</span>
                <span className="text-sm text-blue-500 font-medium">{totalQuizScore}/{totalQuizQuestions}</span>
              </div>
            </div>

            {/* Spelling Summary */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Spelling</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-700">{spellingCorrect}</span>
                <span className="text-sm text-purple-500 font-medium">/{totalWords} đúng</span>
              </div>
            </div>

            {/* Fill Blank Summary */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Fill Blank</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-700">{fillPercentage}%</span>
                <span className="text-sm text-green-500 font-medium">{fillBlankScore}/{totalFillQuestions}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SRS Progress Card */}
      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Lộ trình ghi nhớ (Spaced Repetition)
          </h3>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {words.map((word) => {
              const stage = word.meta?.stage || 0
              const isInWrongSet = session.wrongSet.includes(word._id)

              return (
                <div key={word._id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isInWrongSet ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <div>
                      <p className="font-semibold text-slate-900">{word.word}</p>
                      <p className="text-xs text-slate-500">{word.meaning_vi}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isInWrongSet ? 'text-orange-600' : 'text-blue-600'}`}>
                      {isInWrongSet ? 'Cần ôn ngay' : getNextReviewLabel(word)}
                    </p>
                    <div className="flex gap-0.5 mt-1 justify-end">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={`w-3 h-1 rounded-full ${s <= stage ? 'bg-blue-500' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
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
