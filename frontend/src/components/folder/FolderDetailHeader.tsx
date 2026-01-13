import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, BookOpen, Trophy, Upload, PlusCircle, PlayCircle, Sparkles, ListOrdered, ChevronDown } from 'lucide-react'
import type { Folder } from './FolderList'

type FolderDetailHeaderProps = {
  folder: Folder | null
  onStartLearning: (mode: 'srs' | 'sequential') => void
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
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 p-6 mb-6">
      {/* Top row: Back + Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToFolders}
            className="hover:bg-white/80 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              {folder?.name || 'Đang tải...'}
            </h1>
            {folder?.description && (
              <p className="text-slate-500 mt-1 max-w-xl text-sm font-medium">{folder.description}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!canStart}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Bắt đầu học
                <ChevronDown className="w-4 h-4 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-white/60 bg-white/90 backdrop-blur-lg">
              <DropdownMenuItem onClick={() => onStartLearning('srs')} className="cursor-pointer rounded-lg m-1">
                <Sparkles className="w-4 h-4 mr-2 text-fuchsia-500" />
                <div>
                  <div className="font-bold text-slate-700">Chế độ SRS</div>
                  <div className="text-[10px] text-slate-500 font-medium">Lặp lại ngắt quãng</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartLearning('sequential')} className="cursor-pointer rounded-lg m-1">
                <ListOrdered className="w-4 h-4 mr-2 text-sky-500" />
                <div>
                  <div className="font-bold text-slate-700">Chế độ Tuần tự</div>
                  <div className="text-[10px] text-slate-500 font-medium">Học theo thứ tự</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={onOpenUpload} className="rounded-xl border-white bg-white/50 hover:bg-white shadow-sm">
            <Upload className="w-4 h-4 mr-2 text-sky-500" />
            Upload
          </Button>
          <Button variant="outline" onClick={onOpenAddWord} className="rounded-xl border-white bg-white/50 hover:bg-white shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2 text-fuchsia-500" />
            Thêm từ
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-sky-50/50 border border-sky-100/50">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <BookOpen className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div className="text-lg font-black text-sky-700 leading-none">{totalWords}</div>
            <div className="text-[10px] text-sky-600/70 font-bold uppercase tracking-wider">Tổng từ</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50/50 border border-amber-100/50">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-700 leading-none">{mastered}</div>
            <div className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider">Đã thuộc</div>
          </div>
        </div>
        <div className="flex-1 min-w-[200px] max-w-xs ml-auto">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-slate-400">TIẾN ĐỘ HỌC</span>
            <span className="text-violet-600">{masteryPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(167,139,250,0.3)]"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FolderDetailHeader
