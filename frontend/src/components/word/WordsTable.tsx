// src/components/word/WordsTable.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit2, Trash2, Sparkles, BookOpen, Wand2 } from 'lucide-react'
import type { Word } from '@/types/word'

interface WordsTableProps {
  words: Word[]
  loading: boolean
  searchQuery: string
  posFilter: string
  onEdit: (word: Word) => void
  onDelete: (wordId: string) => void
  onEnrich?: (wordId: string) => void
  enrichingIds?: string[]
}

const TableHeader = () => (
  <thead className="bg-stone-50/50 border-b border-white/60">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Từ vựng</th>
      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Loại</th>
      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Nghĩa</th>
      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">IPA</th>
      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Ví dụ</th>
      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Thao tác</th>
    </tr>
  </thead>
)

export const WordsTable: React.FC<WordsTableProps> = ({
  words,
  loading,
  searchQuery,
  posFilter,
  onEdit,
  onDelete,
  onEnrich,
  enrichingIds = [],
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white/40 backdrop-blur-md rounded-3xl border border-white/60">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-white/20">
            {[...Array(5)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-6 py-5"><Skeleton className="h-5 w-28 rounded-lg" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-36 rounded-lg" /></td>
                <td className="px-6 py-5"><Skeleton className="h-5 w-20 rounded-lg" /></td>
                <td className="px-6 py-5"><Skeleton className="h-12 w-44 rounded-lg" /></td>
                <td className="px-6 py-5 text-right">
                  <Skeleton className="h-8 w-20 ml-auto rounded-xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-16 text-center shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/50 flex items-center justify-center shadow-sm border border-white">
          <BookOpen className="w-10 h-10 text-violet-300" />
        </div>
        <h3 className="text-xl font-black text-violet-900 mb-2">
          {searchQuery || posFilter ? 'Hổng thấy từ nào hết!' : 'Chưa có từ vựng'}
        </h3>
        <p className="text-slate-500 font-medium">
          {searchQuery || posFilter
            ? 'Thử tìm cái tên khác coi sao bạn ơi.'
            : 'Hãy thêm từ mới để khu vườn trí nhớ thêm rực rỡ!'}
        </p>
      </div>
    )
  }

  const posStyles: any = {
    noun: 'bg-sky-100 text-sky-600 border-sky-200',
    verb: 'bg-rose-100 text-rose-600 border-rose-200',
    adj: 'bg-amber-100 text-amber-600 border-amber-200',
    adv: 'bg-violet-100 text-violet-600 border-violet-200',
    prep: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    phrase: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
  }

  return (
    <div className="overflow-hidden bg-white/40 backdrop-blur-md rounded-3xl border border-white shadow-sm transition-all duration-500">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <TableHeader />
          <tbody className="divide-y divide-white/40">
            {words.map((word) => (
              <tr 
                key={word._id} 
                className="group relative hover:bg-white/80 transition-all duration-300 cursor-default"
              >
                {/* Decorative hover indicator */}
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-violet-400 to-fuchsia-400 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-800 text-base group-hover:text-violet-700 transition-colors">{word.word}</div>
                  {word.note && (
                    <div className="text-[11px] text-slate-500 mt-1 font-medium italic line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">{word.note}</div>
                  )}
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex px-2.5 py-0.5 text-[10px] font-black uppercase rounded-lg border shadow-sm ${posStyles[word.pos] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {word.pos}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-bold max-w-[200px]">
                  {word.meaning_vi}
                </td>
                <td className="px-6 py-5 text-sm text-slate-400 font-mono font-medium">
                  {word.ipa || <span className="opacity-20">—</span>}
                </td>
                
                {/* Simplified Example column */}
                <td className="px-6 py-5 max-w-[300px]">
                  {word.ex1 ? (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-700 font-medium line-clamp-1">{word.ex1.en}</div>
                      <div className="text-[10px] text-slate-400 font-medium line-clamp-1">{word.ex1.vi}</div>
                    </div>
                  ) : (
                    <span className="opacity-20">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEnrich && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEnrich(word._id)}
                        disabled={enrichingIds.includes(word._id)}
                        title="AI Magic"
                        className="text-violet-400 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-colors"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${enrichingIds.includes(word._id) ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(word)}
                      title="Sửa"
                      className="text-slate-300 hover:bg-sky-50 hover:text-sky-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(word._id)}
                      title="Xóa"
                      className="text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
