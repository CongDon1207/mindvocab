// src/components/word/WordsTable.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import type { Word } from '@/types/word'

interface WordsTableProps {
  words: Word[]
  loading: boolean
  searchQuery: string
  posFilter: string
  onEdit: (word: Word) => void
  onDelete: (wordId: string) => void
}

export const WordsTable: React.FC<WordsTableProps> = ({
  words,
  loading,
  searchQuery,
  posFilter,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>
  }

  if (words.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {searchQuery || posFilter
          ? 'Không tìm thấy từ phù hợp.'
          : 'Chưa có từ vựng nào. Hãy thêm từ mới!'}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Từ</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loại</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nghĩa</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">IPA</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ví dụ 1</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ví dụ 2</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {words.map((word) => (
            <tr key={word._id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">{word.word}</div>
                {word.note && (
                  <div className="text-xs text-gray-500 mt-1 italic">{word.note}</div>
                )}
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">{word.pos}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{word.meaning_vi}</td>
              <td className="px-4 py-4 text-sm text-gray-500">{word.ipa || '-'}</td>
              
              {/* Example 1 */}
              <td className="px-4 py-4">
                {word.ex1 ? (
                  <div className="text-xs">
                    <div className="text-gray-700">{word.ex1.en}</div>
                    <div className="text-gray-500 mt-1">{word.ex1.vi}</div>
                    {word.ex1.source === 'inferred' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">
                        [Inferred]
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>

              {/* Example 2 */}
              <td className="px-4 py-4">
                {word.ex2 ? (
                  <div className="text-xs">
                    <div className="text-gray-700">{word.ex2.en}</div>
                    <div className="text-gray-500 mt-1">{word.ex2.vi}</div>
                    {word.ex2.source === 'inferred' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded">
                        [Inferred]
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-4 py-4 text-sm text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(word)}
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(word._id)}
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
