// src/pages/FolderDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Trash2 } from 'lucide-react'
import api from '@/lib/axios'
import { WordFormDialog } from '@/components/word'
import type { Folder } from '@/components/folder'
import type { Word, GetWordsResponse, WordFormValues } from '@/types/word'

const FolderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ========== STATE MANAGEMENT ==========
  const [folder, setFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination & filters
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [posFilter, setPosFilter] = useState('')

  // Modal states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)

  // ========== DATA FETCHING ==========
  useEffect(() => {
    if (!id) return
    fetchFolder()
    fetchWords()
  }, [id, page, searchQuery, posFilter])

  const fetchFolder = async () => {
    try {
      const res = await api.get<Folder>(`/folders/${id}`)
      setFolder(res.data)
    } catch (err: any) {
      setError('Không tìm thấy folder.')
      console.error(err)
    }
  }

  const fetchWords = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const skip = (page - 1) * limit
      const params: any = { skip, limit }
      if (searchQuery) params.q = searchQuery
      if (posFilter) params.pos = posFilter

      const res = await api.get<GetWordsResponse>(`/folders/${id}/words`, { params })
      setWords(res.data.words)
      setTotal(res.data.total)
    } catch (err: any) {
      setError('Không thể tải danh sách từ.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ========== HANDLERS ==========
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1) // reset về trang 1
  }

  const handlePosFilter = (value: string) => {
    setPosFilter(value)
    setPage(1)
  }

  const handleAddWord = async (values: WordFormValues) => {
    try {
      await api.post('/words', { ...values, folderId: id })
      setIsAddDialogOpen(false)
      fetchWords()
      fetchFolder() // cập nhật totalWords
      alert('Thêm từ thành công!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể thêm từ.')
    }
  }

  const handleUpdateWord = async (wordId: string, values: WordFormValues) => {
    try {
      await api.put(`/words/${wordId}`, values)
      setEditingWord(null)
      fetchWords()
      alert('Cập nhật từ thành công!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể cập nhật từ.')
    }
  }

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa từ này?')) return
    try {
      await api.delete(`/words/${wordId}`)
      fetchWords()
      fetchFolder()
      alert('Xóa từ thành công!')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể xóa từ.')
    }
  }

  // ========== COMPUTED VALUES ==========
  const totalPages = Math.ceil(total / limit)

  // ========== RENDER ==========
  if (error && !folder) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/folders')}>Quay lại danh sách folder</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{folder?.name || 'Loading...'}</h1>
              {folder?.description && (
                <p className="text-gray-600 mt-2">{folder.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Tổng số từ: <span className="font-semibold">{folder?.stats?.totalWords || 0}</span>
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>+ Thêm từ mới</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm từ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={posFilter}
              onChange={(e) => handlePosFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Tất cả loại từ</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adj">Adjective</option>
              <option value="adv">Adverb</option>
            </select>
          </div>
        </div>

        {/* Words Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          )}

          {!loading && words.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || posFilter ? 'Không tìm thấy từ phù hợp.' : 'Chưa có từ vựng nào. Hãy thêm từ mới!'}
            </div>
          )}

          {!loading && words.length > 0 && (
            <>
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Từ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nghĩa</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {words.map((word) => (
                    <tr key={word._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{word.word}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{word.pos}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{word.meaning_vi}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingWord(word)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWord(word._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} / {total} từ
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <span className="px-3 py-1 text-sm">Trang {page} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Word Dialog */}
      <WordFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddWord}
        title="Thêm từ mới"
        submitButtonText="Thêm"
      />

      {/* Edit Word Dialog */}
      {editingWord && (
        <WordFormDialog
          open={!!editingWord}
          onOpenChange={(open) => !open && setEditingWord(null)}
          onSubmit={(values) => handleUpdateWord(editingWord._id, values)}
          defaultValues={{
            word: editingWord.word,
            pos: editingWord.pos,
            meaning_vi: editingWord.meaning_vi,
            ipa: editingWord.ipa || '',
            note: editingWord.note || '',
          }}
          title="Chỉnh sửa từ"
          submitButtonText="Lưu"
        />
      )}
    </div>
  )
}

export default FolderDetail
