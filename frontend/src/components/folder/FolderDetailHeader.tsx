import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Trophy, Upload, PlusCircle, PlayCircle } from 'lucide-react'
import type { Folder } from './FolderList'

type FolderDetailHeaderProps = {
  folder: Folder | null
  onStartLearning: () => void
  onOpenUpload: () => void
  onOpenAddWord: () => void
  canStart: boolean
  onBackToFolders: () => void
}

const FolderDetailHeader: React.FC<FolderDetailHeaderProps> = ({
  folder,
  onStartLearning,
  onOpenUpload,
  onOpenAddWord,
  canStart,
  onBackToFolders
}) => {
  const totalWords = folder?.stats?.totalWords || 0
  const mastered = folder?.stats?.mastered || 0
  const masteryPercent = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-6">
      {/* Top row: Back + Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBackToFolders}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {folder?.name || 'Đang tải...'}
            </h1>
            {folder?.description && (
              <p className="text-slate-500 mt-1 max-w-xl">{folder.description}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Button
            onClick={onStartLearning}
            disabled={!canStart}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Bắt đầu học
          </Button>
          <Button variant="outline" onClick={onOpenUpload} className="shadow-sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload file
          </Button>
          <Button variant="outline" onClick={onOpenAddWord} className="shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm từ
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-xl font-bold text-blue-600">{totalWords}</div>
            <div className="text-xs text-blue-500/70">Tổng từ</div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-xl font-bold text-amber-600">{mastered}</div>
            <div className="text-xs text-amber-500/70">Đã thuộc</div>
          </div>
        </div>
        <div className="flex-1 min-w-[200px] max-w-xs">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-500">Tiến độ học</span>
            <span className="font-semibold text-slate-700">{masteryPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FolderDetailHeader
