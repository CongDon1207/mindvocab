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
  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200">
    <tr>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Từ vựng</th>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Loại</th>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nghĩa</th>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">IPA</th>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ví dụ 1</th>
      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ví dụ 2</th>
      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao tác</th>
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
      <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-4"><Skeleton className="h-5 w-28 rounded-md" /></td>
                <td className="px-4 py-4"><Skeleton className="h-5 w-14 rounded-md" /></td>
                <td className="px-4 py-4"><Skeleton className="h-5 w-36 rounded-md" /></td>
                <td className="px-4 py-4"><Skeleton className="h-5 w-20 rounded-md" /></td>
                <td className="px-4 py-4"><Skeleton className="h-12 w-44 rounded-md" /></td>
                <td className="px-4 py-4"><Skeleton className="h-12 w-44 rounded-md" /></td>
                <td className="px-4 py-4 text-right">
                  <Skeleton className="h-8 w-20 ml-auto rounded-md" />
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
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          {searchQuery || posFilter ? 'Không tìm thấy từ' : 'Chưa có từ vựng'}
        </h3>
        <p className="text-sm text-slate-500">
          {searchQuery || posFilter
            ? 'Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.'
            : 'Hãy thêm từ mới hoặc upload file để bắt đầu!'}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <tbody className="divide-y divide-slate-100">
            {words.map((word) => (
              <tr 
                key={word._id} 
                className="group hover:bg-blue-50/50 transition-colors duration-150"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-800">{word.word}</div>
                  {word.note && (
                    <div className="text-xs text-slate-500 mt-1 italic line-clamp-2">{word.note}</div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {word.pos}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 max-w-[200px]">
                  {word.meaning_vi}
                </td>
                <td className="px-4 py-4 text-sm text-slate-500 font-mono">
                  {word.ipa || <span className="text-slate-300">—</span>}
                </td>
                
                {/* Example 1 */}
                <td className="px-4 py-4 max-w-[220px]">
                  {word.ex1 ? (
                    <div className="text-xs space-y-1">
                      <div className="text-slate-700 line-clamp-2">{word.ex1.en}</div>
                      <div className="text-slate-500 line-clamp-2">{word.ex1.vi}</div>
                      {word.ex1.source === 'inferred' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-[10px] rounded-full border border-blue-100">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* Example 2 */}
                <td className="px-4 py-4 max-w-[220px]">
                  {word.ex2 ? (
                    <div className="text-xs space-y-1">
                      <div className="text-slate-700 line-clamp-2">{word.ex2.en}</div>
                      <div className="text-slate-500 line-clamp-2">{word.ex2.vi}</div>
                      {word.ex2.source === 'inferred' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-[10px] rounded-full border border-blue-100">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEnrich && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEnrich(word._id)}
                        disabled={enrichingIds.includes(word._id)}
                        title="Bổ sung thông tin bằng AI"
                        className="text-purple-500 hover:bg-purple-100 hover:text-purple-600"
                      >
                        <Wand2 className={`w-4 h-4 ${enrichingIds.includes(word._id) ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(word)}
                      title="Chỉnh sửa"
                      className="text-slate-400 hover:bg-blue-100 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(word._id)}
                      title="Xóa"
                      className="text-slate-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
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
