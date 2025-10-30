// src/pages/FolderDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import { WordFormDialog, WordsTable } from '@/components/word'
import { UploadWordsDialog, ImportStatusDrawer } from '@/components/import'
import {
  FolderDetailHeader,
  FolderWordFilters,
  FolderPagination,
  type Folder,
} from '@/components/folder'
import type { Word, GetWordsResponse, WordFormValues } from '@/types/word'
import type { ImportJob } from '@/types/import'
import { toast } from 'sonner'

const FolderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [posFilter, setPosFilter] = useState('')

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

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

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handlePosFilter = (value: string) => {
    setPosFilter(value)
    setPage(1)
  }

  const handleAddWord = async (values: WordFormValues) => {
    try {
      const payload: any = {
        folderId: id,
        word: values.word,
        pos: values.pos,
        meaning_vi: values.meaning_vi,
        ipa: values.ipa,
        note: values.note,
      }
      // Chỉ thêm ex1/ex2 nếu có cả en và vi
      if (values.ex1_en && values.ex1_vi) {
        payload.ex1 = { en: values.ex1_en, vi: values.ex1_vi, source: 'user' }
      }
      if (values.ex2_en && values.ex2_vi) {
        payload.ex2 = { en: values.ex2_en, vi: values.ex2_vi, source: 'user' }
      }
      
      await api.post('/words', payload)
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
      const payload: any = {
        word: values.word,
        pos: values.pos,
        meaning_vi: values.meaning_vi,
        ipa: values.ipa,
        note: values.note,
      }
      // Chỉ thêm ex1/ex2 nếu có cả en và vi
      if (values.ex1_en && values.ex1_vi) {
        payload.ex1 = { en: values.ex1_en, vi: values.ex1_vi, source: 'user' }
      }
      if (values.ex2_en && values.ex2_vi) {
        payload.ex2 = { en: values.ex2_en, vi: values.ex2_vi, source: 'user' }
      }
      
      await api.put(`/words/${wordId}`, payload)
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

  const handleStartLearning = async () => {
    if (!id) return
    
    if (!folder?.stats?.totalWords || folder.stats.totalWords === 0) {
      alert('Folder chưa có từ vựng nào. Vui lòng thêm từ trước khi bắt đầu học.')
      return
    }

    try {
      // Create new session
      const res = await api.post('/sessions', { folderId: id })
      const sessionId = res.data._id
      
      // Navigate to session page
      navigate(`/sessions/${sessionId}`)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Không thể tạo session học.')
      console.error(err)
    }
  }

  const handleImportJobCreated = (jobId: string) => {
    setActiveJobId(jobId)
    setIsImportDrawerOpen(true)
    toast('Đang xử lý import', {
      description: `Job #${jobId} đang chạy ở nền.`,
    })
  }

  const handleJobFinished = (job: ImportJob) => {
    if (job.status === 'DONE') {
      toast.success('Import hoàn tất', {
        description: `Đã nhập ${job.counters.parsedOk} dòng (AI bổ sung ${job.counters.enrichedOk}).`,
      })
    } else {
      toast.error('Import thất bại', {
        description: 'Vui lòng xem báo cáo để biết chi tiết lỗi.',
      })
    }
    fetchWords()
    fetchFolder()
  }

  const totalPages = Math.ceil(total / limit)

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
        <FolderDetailHeader
          folder={folder}
          onStartLearning={handleStartLearning}
          onOpenUpload={() => setIsUploadDialogOpen(true)}
          onOpenAddWord={() => setIsAddDialogOpen(true)}
          canStart={Boolean(folder?.stats?.totalWords)}
          onBackToFolders={() => navigate('/')}
        />

        <FolderWordFilters
          searchQuery={searchQuery}
          onSearch={handleSearch}
          posFilter={posFilter}
          onPosChange={handlePosFilter}
        />

        {/* Words Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <WordsTable
            words={words}
            loading={loading}
            searchQuery={searchQuery}
            posFilter={posFilter}
            onEdit={setEditingWord}
            onDelete={handleDeleteWord}
          />

          {!loading && words.length > 0 && (
            <FolderPagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
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
            ex1_en: editingWord.ex1?.en || '',
            ex1_vi: editingWord.ex1?.vi || '',
            ex2_en: editingWord.ex2?.en || '',
            ex2_vi: editingWord.ex2?.vi || '',
          }}
          title="Chỉnh sửa từ"
          submitButtonText="Lưu"
        />
      )}

      <UploadWordsDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        folderId={id!}
        onJobCreated={handleImportJobCreated}
      />

      <ImportStatusDrawer
        open={isImportDrawerOpen}
        onOpenChange={setIsImportDrawerOpen}
        jobId={activeJobId}
        onJobFinished={handleJobFinished}
      />
    </div>
  )
}

export default FolderDetail
