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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToFolder}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
            {stepLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Title Card */}
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {folderName}
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="flex gap-4">
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 min-w-[120px] text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
              <BookOpen className="w-5 h-5" />
              <span className="text-2xl font-black">{total}</span>
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tổng từ</p>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 min-w-[120px] text-center">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
              <Zap className="w-5 h-5 fill-amber-500" />
              <span className="text-2xl font-black">{mastered}</span>
            </div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Đã thuộc</p>
          </div>
        </div>

        {/* Global Progress Bar Card */}
        <div className="flex-[1.5] bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-400 font-medium">Tiến độ học</span>
            <span className="text-xl font-black text-slate-800">{progressPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionHeader
