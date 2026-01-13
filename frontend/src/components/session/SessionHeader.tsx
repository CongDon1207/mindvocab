// src/components/session/SessionHeader.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap, BookOpen } from 'lucide-react'

interface SessionHeaderProps {
  folderName: string
  stepLabel: string
  folderStats?: {
    totalWords: number
    mastered: number
  }
  onBackToFolder?: () => void
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  folderName,
  stepLabel,
  folderStats,
  onBackToFolder
}) => {
  const mastered = folderStats?.mastered || 0
  const total = folderStats?.totalWords || 0
  const progressPercentage = total > 0 ? Math.round((mastered / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToFolder}
          className="text-slate-500 hover:text-slate-800 hover:bg-white/40 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dừng học
        </Button>
        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 bg-violet-100/50 text-violet-600 border border-violet-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            {stepLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Title Card - Focused */}
        <div className="flex-[2] bg-white/60 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ĐANG HỌC BỘ TỪ</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            {folderName}
          </h1>
        </div>

        {/* Stats Grid - Glassy */}
        <div className="flex gap-3">
          <div className="bg-sky-50/50 backdrop-blur-sm rounded-[2rem] p-5 border border-sky-100/50 flex flex-col items-center justify-center min-w-[110px] shadow-sm">
            <div className="p-2 bg-white rounded-xl mb-2 shadow-sm">
              <BookOpen className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-2xl font-black text-sky-700">{total}</span>
            <p className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">Từ vựng</p>
          </div>

          <div className="bg-amber-50/50 backdrop-blur-sm rounded-[2rem] p-5 border border-amber-100/50 flex flex-col items-center justify-center min-w-[110px] shadow-sm">
            <div className="p-2 bg-white rounded-xl mb-2 shadow-sm">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-700">{mastered}</span>
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Đã thuộc</p>
          </div>
        </div>

        {/* Global Progress Bar Card */}
        <div className="flex-[1.5] bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border border-white flex flex-col justify-center shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TỔNG TIẾN ĐỘ</span>
            <span className="text-2xl font-black text-violet-600">{progressPercentage}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden border border-white">
            <div
              className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(167,139,250,0.4)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionHeader
