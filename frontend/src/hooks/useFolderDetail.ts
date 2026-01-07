import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import api from '@/lib/axios'
import type { Word, GetWordsResponse, WordFormValues } from '@/types/word'
import type { Folder, FolderStatistics } from '@/types/folder'
import type { ImportJob } from '@/types/import'
import { toast } from 'sonner'

export const useFolderDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()

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
    const [enrichingIds, setEnrichingIds] = useState<string[]>([])

    const [activeTab, setActiveTab] = useState<'words' | 'stats'>('words')
    const [folderStats, setFolderStats] = useState<FolderStatistics | null>(null)
    const [statsLoading, setStatsLoading] = useState(false)

    const fetchFolder = async () => {
        try {
            const res = await api.get<Folder>(`/folders/${id}`)
            setFolder(res.data)
        } catch (err: any) {
            setError('Không tìm thấy folder.')
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
            setWords(Array.isArray(res.data?.words) ? res.data.words : [])
            setTotal(res.data?.total || 0)
        } catch (err: any) {
            setError('Không thể tải danh sách từ.')
            setWords([])
        } finally {
            setLoading(false)
        }
    }

    const fetchFolderStats = async () => {
        if (!id) return
        setStatsLoading(true)
        try {
            const res = await api.get<FolderStatistics>(`/folders/${id}/stats`)
            setFolderStats(res.data)
        } catch (err) {
            toast.error('Không thể tải thống kê.')
        } finally {
            setStatsLoading(false)
        }
    }

    useEffect(() => {
        if (!id) return
        fetchFolder()
        if (activeTab === 'words') fetchWords()
        else fetchFolderStats()
    }, [id, page, searchQuery, posFilter, activeTab])

    const handleAddWord = async (values: WordFormValues) => {
        try {
            const payload: any = { folderId: id, ...values }
            await api.post('/words', payload)
            setIsAddDialogOpen(false)
            fetchWords()
            fetchFolder()
            toast.success('Thêm từ thành công!')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể thêm từ.')
        }
    }

    const handleUpdateWord = async (wordId: string, values: WordFormValues) => {
        try {
            await api.put(`/words/${wordId}`, values)
            setEditingWord(null)
            fetchWords()
            toast.success('Cập nhật từ thành công!')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể cập nhật từ.')
        }
    }

    const handleDeleteWord = async (wordId: string) => {
        if (!confirm('Bạn chắc chắn muốn xóa từ này?')) return
        try {
            await api.delete(`/words/${wordId}`)
            fetchWords()
            fetchFolder()
            toast.success('Xóa từ thành công!')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể xóa từ.')
        }
    }

    const handleEnrichWord = async (wordId: string) => {
        setEnrichingIds((prev) => [...prev, wordId])
        try {
            const res = await api.post(`/words/${wordId}/enrich`)
            toast.success(res.data.message || 'Đã bổ sung thông tin.')
            fetchWords()
        } catch (err: any) {
            toast.error('Không thể bổ sung thông tin.')
        } finally {
            setEnrichingIds((prev) => prev.filter((i) => i !== wordId))
        }
    }

    const handleStartLearning = async (mode: 'srs' | 'sequential' = 'srs') => {
        if (!id) return
        if (!folder?.stats?.totalWords) {
            toast.error('Folder chưa có từ vựng nào.')
            return
        }
        try {
            const res = await api.post('/sessions', { folderId: id, mode })
            navigate(`/sessions/${res.data._id}`)
        } catch (err: any) {
            toast.error('Không thể tạo session học.')
        }
    }

    const handleStartRetrySession = async (wordIds: string[]) => {
        if (!id) return
        toast.info('Đang tạo session ôn tập...')
        try {
            const res = await api.post('/sessions', { folderId: id, wordIds })
            navigate(`/sessions/${res.data._id}`)
        } catch (err: any) {
            toast.error('Không thể tạo session ôn tập.')
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
                description: `Đã nhập ${job.counters.parsedOk} dòng.`,
            })
        } else {
            toast.error('Import thất bại')
        }
        fetchWords()
        fetchFolder()
    }

    return {
        id, folder, words, total, loading, error, page, limit, totalPages: Math.ceil(total / limit),
        searchQuery, posFilter, isAddDialogOpen, editingWord, isUploadDialogOpen, isImportDrawerOpen,
        activeJobId, enrichingIds, activeTab, folderStats, statsLoading,
        setPage, setSearchQuery, setPosFilter, setIsAddDialogOpen, setEditingWord, setIsUploadDialogOpen,
        setIsImportDrawerOpen, setActiveTab, handleAddWord, handleUpdateWord, handleDeleteWord,
        handleEnrichWord, handleStartLearning, handleStartRetrySession,
        handleImportJobCreated, handleJobFinished, fetchWords, fetchFolder, navigate, location
    }
}
