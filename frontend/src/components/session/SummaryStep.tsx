// src/components/session/SummaryStep.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCcw, 
  Home, 
  Calendar, 
  Trophy, 
  Medal, 
  Target, 
  Zap, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react'
import api from '@/lib/axios'
import type { Session } from '@/types/session'
import type { Word } from '@/types/word'
import { cn } from '@/lib/utils'

interface SummaryStepProps {
  session: Session
}

const SummaryStep: React.FC<SummaryStepProps> = ({ session }) => {
  const navigate = useNavigate()
  const words = session.wordIds as unknown as Word[]
  const [isStartingNext, setIsStartingNext] = useState(false)
  const [hasNextBatch, setHasNextBatch] = useState(true)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

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

  // Logic lấy dữ liệu nhận xét phong cách Game - Tươi sáng & Dịu nhẹ
  const getPerformanceData = () => {
    if (quizPercentage >= 95 && wrongWords.length === 0) {
      return {
        title: "Tuyệt vời!",
        desc: "Bạn đã chinh phục toàn bộ từ vựng một cách tuyệt đối. Thật đáng kinh ngạc!",
        color: "text-indigo-600",
        gradient: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50",
        blob: "from-violet-200 via-purple-200 to-pink-200",
        textGradient: "from-indigo-600 via-purple-600 to-pink-600",
        border: "border-purple-100",
        icon: <Trophy className="w-12 h-12 text-indigo-400 animate-pulse" />,
        badge: "S+"
      }
    }
    if (quizPercentage >= 80) {
      return {
        title: "Làm tốt lắm!",
        desc: `Bạn đã nắm vững phần lớn từ vựng. Chỉ còn ${wrongWords.length} từ cần lưu ý thêm.`,
        color: "text-blue-600",
        gradient: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50",
        blob: "from-blue-200 via-sky-200 to-indigo-200",
        textGradient: "from-blue-600 via-sky-600 to-indigo-600",
        border: "border-blue-100",
        icon: <Medal className="w-12 h-12 text-blue-400" />,
        badge: "A"
      }
    }
    if (quizPercentage >= 60) {
      return {
        title: "Khá tốt!",
        desc: `Bạn đang tiến bộ rất nhanh. Hãy xem lại ${wrongWords.length} từ chưa vững để nhớ lâu hơn.`,
        color: "text-teal-600",
        gradient: "bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50",
        blob: "from-teal-200 via-emerald-200 to-cyan-200",
        textGradient: "from-teal-600 via-emerald-600 to-cyan-600",
        border: "border-teal-100",
        icon: <Target className="w-12 h-12 text-teal-400" />,
        badge: "B"
      }
    }
    return {
      title: "Cố gắng lên!",
      desc: "Mỗi ngày một chút sẽ tạo nên sự khác biệt. Hãy thử lại để bứt phá nhé!",
      color: "text-amber-700",
      gradient: "bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90",
      blob: "from-amber-300/40 via-orange-300/30 to-yellow-300/40",
      textGradient: "from-amber-600 via-orange-600 to-yellow-500",
      border: "border-amber-100",
      icon: <Zap className="w-12 h-12 text-yellow-500 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse" />,
      badge: "C"
    }
  }

  const perf = getPerformanceData()


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
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* 🏆 HERO SECTION: Performance Insight & Grade */}
      <div className={cn(
        "relative overflow-hidden rounded-[2.5rem] border p-8 md:p-10 shadow-2xl shadow-slate-200/40 transition-all duration-700",
        perf.gradient, perf.border
      )}>
        {/* Background decorative elements - Lower opacity and z-index to avoid obscuring text */}
        <div className={cn("absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[120px] opacity-50 bg-gradient-to-br animate-pulse duration-[5000ms] z-0", perf.blob)} />
        <div className={cn("absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-30 bg-gradient-to-tr z-0", perf.blob)} />

        <div className="relative z-20 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Grade Badge */}
          <div className="relative group shrink-0">
            <div className={cn(
              "absolute inset-0 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity bg-gradient-to-br",
              perf.blob
            )} />
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center border-4 border-white shadow-2xl">
              <span className={cn(
                "text-6xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-br bg-clip-text text-transparent drop-shadow-sm", 
                perf.textGradient
              )}>
                {perf.badge}
              </span>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-50 transform rotate-12 group-hover:rotate-0 transition-all duration-500">
                {perf.icon}
              </div>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="flex-1 text-center md:text-left space-y-5">
            <div className="space-y-2">
              <p className={cn("text-[10px] font-black uppercase tracking-[0.6em] opacity-60 mix-blend-multiply", perf.color)}>KẾT QUẢ SESSION</p>
              <h2 className={cn(
                "text-4xl md:text-5xl font-black tracking-tight leading-[1.1] bg-gradient-to-r bg-clip-text text-transparent",
                perf.textGradient
              )}>
                {perf.title}
              </h2>
            </div>
            <p className="text-xl text-slate-800/90 font-medium leading-relaxed max-w-xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {perf.desc}
            </p>
            
            {/* AI Feedback Interaction */}
            <div className="flex items-center justify-center md:justify-start gap-5 pt-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/50">Phản hồi của bạn</span>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setFeedback('up')}
                  className={cn(
                    "h-10 w-10 rounded-2xl transition-all duration-500 border relative group overflow-hidden",
                    feedback === 'up' 
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-400 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] scale-110" 
                      : "bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-400 hover:border-emerald-200 hover:text-emerald-500 hover:shadow-lg hover:shadow-emerald-100/50"
                  )}
                >
                  <ThumbsUp className={cn("w-4.5 h-4.5 transition-transform duration-500 group-hover:-translate-y-0.5", feedback === 'up' && "fill-white")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setFeedback('down')}
                  className={cn(
                    "h-10 w-10 rounded-2xl transition-all duration-500 border relative group overflow-hidden",
                    feedback === 'down' 
                      ? "bg-gradient-to-br from-rose-400 to-pink-500 border-rose-400 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.4)] scale-110" 
                      : "bg-white/80 backdrop-blur-sm border-slate-200/60 text-slate-400 hover:border-rose-200 hover:text-rose-500 hover:shadow-lg hover:shadow-rose-100/50"
                  )}
                >
                  <ThumbsDown className={cn("w-4.5 h-4.5 transition-transform duration-500 group-hover:translate-y-0.5", feedback === 'down' && "fill-white")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 STATS SECTION: Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz Bento */}
        <Card className="rounded-[2rem] border-blue-100 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Star className="w-4 h-4 fill-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Độ chính xác Quiz</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform inline-block origin-left">{quizPercentage}%</span>
              <span className="text-sm font-bold text-slate-400">{totalQuizScore}/{totalQuizQuestions}</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${quizPercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Spelling Bento */}
        <Card className="rounded-[2rem] border-fuchsia-100 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-fuchsia-600">
              <Zap className="w-4 h-4 fill-fuchsia-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Chính tả (Spelling)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform inline-block origin-left">{spellingCorrect}</span>
              <span className="text-sm font-bold text-slate-400">/{totalWords} từ</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-fuchsia-500 rounded-full transition-all duration-1000" style={{ width: `${(spellingCorrect / totalWords) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Fill Blank Bento */}
        <Card className="rounded-[2rem] border-emerald-100 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles className="w-4 h-4 fill-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ngữ cảnh (Fill Blank)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 tracking-tighter group-hover:scale-110 transition-transform inline-block origin-left">{fillPercentage}%</span>
              <span className="text-sm font-bold text-slate-400">{fillBlankScore}/{totalFillQuestions}</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${fillPercentage}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📅 SRS PROGRESS CARD */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white/40 backdrop-blur-md">
        <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter text-lg">
            <Calendar className="w-6 h-6 text-violet-600" />
            Lộ trình ghi nhớ (SRS)
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Cập nhật sau session</span>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100/50">
            {words.map((word) => {
              const stage = word.meta?.stage || 0
              const isInWrongSet = session.wrongSet.includes(word._id)

              return (
                <div key={word._id} className="group flex items-center justify-between px-8 py-4 hover:bg-white/60 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full shadow-sm",
                      isInWrongSet ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                    )} />
                    <div>
                      <p className="font-bold text-slate-800 text-base">{word.word}</p>
                      <p className="text-xs text-slate-400 font-medium italic">{word.meaning_vi}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-black uppercase tracking-widest mb-1.5",
                      isInWrongSet ? 'text-orange-600' : 'text-violet-600'
                    )}>
                      {isInWrongSet ? 'Cần ôn ngay' : getNextReviewLabel(word)}
                    </p>
                    <div className="flex gap-1 justify-end">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div
                          key={s}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            s <= stage ? "w-4 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]" : "w-1.5 bg-slate-200"
                          )}
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

      {/* ⚠️ WRONG WORDS REVIEW */}
      {wrongWords.length > 0 && (
        <Card className="rounded-[2.5rem] border-orange-100 bg-orange-50/30 overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="flex items-center gap-3 text-orange-700 font-black uppercase tracking-tighter">
              <AlertCircle className="w-6 h-6" />
              Từ cần ôn lại ({wrongWords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {wrongWords.map((word, idx) => (
                <div
                  key={word._id}
                  className="flex items-start gap-4 p-5 bg-white/80 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-lg leading-tight">
                      {word.word}
                    </p>
                    <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">{word.pos}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{word.meaning_vi}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🕹️ ACTIONS: Floating Style */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white/80 backdrop-blur-2xl border border-white p-3 rounded-[2.5rem] shadow-2xl flex gap-3 justify-center items-center">
          {!session.isRetry && (
            <Button
              onClick={handleStartNext}
              disabled={isStartingNext || !hasNextBatch}
              className="h-14 px-8 rounded-[1.8rem] bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 text-sm font-black uppercase tracking-widest gap-2 flex-1"
            >
              <RefreshCcw className={cn("w-4 h-4", isStartingNext && "animate-spin")} />
              {hasNextBatch ? (isStartingNext ? 'Đang tạo...' : 'Học tiếp 10 từ') : 'Hết từ mới'}
            </Button>
          )}
          {wrongWords.length > 0 && (
            <Button
              onClick={handleRetryWrong}
              variant="secondary"
              className="h-14 px-6 rounded-[1.8rem] bg-orange-100 text-orange-700 hover:bg-orange-200 text-sm font-black uppercase tracking-widest gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Ôn từ sai ({wrongWords.length})
            </Button>
          )}
          <Button
            onClick={handleFinish}
            variant="ghost"
            className="h-14 w-14 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}


export default SummaryStep
