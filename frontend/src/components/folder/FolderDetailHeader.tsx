import React from 'react'
import { ArrowLeft, BookOpen, ListOrdered, PlusCircle, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Folder } from './FolderList'

type Props = {
  folder: Folder | null
  onStartLearning: (mode: 'srs' | 'sequential', action?: 'continue' | 'restart') => void
  onOpenUpload: () => void
  onOpenAddWord: () => void
  canStart: boolean
  onBackToFolders: () => void
}

const FolderDetailHeader: React.FC<Props> = ({ folder, onStartLearning, onOpenUpload, onOpenAddWord, canStart, onBackToFolders }) => {
  const stats = folder?.stats
  const total = stats?.totalWords || 0
  return <section className="space-y-5 rounded-3xl border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl">
    <div className="flex flex-col justify-between gap-4 md:flex-row">
      <div className="flex gap-3"><Button variant="ghost" size="sm" onClick={onBackToFolders}><ArrowLeft className="mr-1 h-4 w-4" />Quay lại</Button><div><h1 className="text-2xl font-black text-violet-700">{folder?.name || 'Đang tải...'}</h1><p className="mt-1 text-sm text-slate-500">{folder?.description}</p></div></div>
      <div className="flex gap-2"><Button variant="outline" onClick={onOpenUpload}><Upload className="mr-2 h-4 w-4" />Upload</Button><Button variant="outline" onClick={onOpenAddWord}><PlusCircle className="mr-2 h-4 w-4" />Thêm từ</Button></div>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <button disabled={!canStart} onClick={() => onStartLearning('srs')} className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-left disabled:opacity-50"><span className="flex items-center gap-2 font-black text-violet-700"><Sparkles className="h-5 w-5" />Học hôm nay · SRS</span><span className="mt-1 block text-sm text-slate-600">Hệ thống chọn các từ đến hạn trước, rồi thêm từ mới cho đủ tối đa 10.</span></button>
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4"><span className="flex items-center gap-2 font-black text-sky-700"><ListOrdered className="h-5 w-5" />Ôn theo danh sách</span><span className="mt-1 block text-sm text-slate-600">Ôn lần lượt toàn bộ folder từ A–Z. Không thay đổi Stage hoặc lịch SRS.</span><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" disabled={!canStart} onClick={() => onStartLearning('sequential', 'continue')}>Tiếp tục</Button><Button size="sm" variant="outline" disabled={!canStart} onClick={() => onStartLearning('sequential', 'restart')}>Bắt đầu lại từ đầu</Button></div></div>
    </div>
    <p className="text-center text-xs font-medium text-slate-500">Không chắc nên chọn gì? Hãy chọn Học hôm nay.</p>
    <div className="flex flex-wrap gap-4 text-sm text-slate-600"><span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{total} tổng từ</span><span>Đã học {stats?.learned || 0}/{total}</span><span>Cần ôn hôm nay: {stats?.dueToday || 0}</span><span>Thành thạo: {stats?.mastered || 0}</span></div>
  </section>
}

export default FolderDetailHeader
