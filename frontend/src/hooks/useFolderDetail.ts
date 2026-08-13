import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import api from '@/lib/axios'
import type { Folder, FolderStatistics } from '@/types/folder'
import type { ImportJob } from '@/types/import'
import type { GetWordsResponse, Word, WordFormValues } from '@/types/word'
import { toast } from 'sonner'

export const useFolderDetail = () => {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate(); const location = useLocation()
  const [folder, setFolder] = useState<Folder | null>(null); const [words, setWords] = useState<Word[]>([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1); const [searchQuery, setSearchQuery] = useState(''); const [posFilter, setPosFilter] = useState(''); const limit = 20
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); const [editingWord, setEditingWord] = useState<Word | null>(null); const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false); const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false); const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'words' | 'stats'>('words'); const [folderStats, setFolderStats] = useState<FolderStatistics | null>(null); const [statsLoading, setStatsLoading] = useState(false)
  const fetchFolder = async () => { try { setFolder((await api.get<Folder>(`/folders/${id}`)).data) } catch { setError('Không tìm thấy folder.') } }
  const fetchWords = async () => { if (!id) return; try { setLoading(true); const result = await api.get<GetWordsResponse>(`/folders/${id}/words`, { params: { skip: (page - 1) * limit, limit, ...(searchQuery && { q: searchQuery }), ...(posFilter && { pos: posFilter }) } }); setWords(result.data.words || []); setTotal(result.data.total || 0) } catch { setError('Không thể tải danh sách từ.') } finally { setLoading(false) } }
  const fetchFolderStats = async () => { if (!id) return; try { setStatsLoading(true); setFolderStats((await api.get<FolderStatistics>(`/folders/${id}/stats`)).data) } catch { toast.error('Không thể tải thống kê.') } finally { setStatsLoading(false) } }
  useEffect(() => { if (!id) return; fetchFolder(); activeTab === 'words' ? fetchWords() : fetchFolderStats() }, [id, page, searchQuery, posFilter, activeTab])
  const handleAddWord = async (values: WordFormValues) => { try { await api.post('/words', { folderId: id, ...values }); setIsAddDialogOpen(false); fetchWords(); fetchFolder(); toast.success('Thêm từ thành công!') } catch (error: any) { toast.error(error.response?.data?.error || 'Không thể thêm từ.') } }
  const handleUpdateWord = async (wordId: string, values: WordFormValues) => { try { await api.put(`/words/${wordId}`, values); setEditingWord(null); fetchWords(); toast.success('Cập nhật từ thành công!') } catch (error: any) { toast.error(error.response?.data?.error || 'Không thể cập nhật từ.') } }
  const handleDeleteWord = async (wordId: string) => { if (!confirm('Bạn chắc chắn muốn xóa từ này?')) return; try { await api.delete(`/words/${wordId}`); fetchWords(); fetchFolder(); toast.success('Xóa từ thành công!') } catch { toast.error('Không thể xóa từ.') } }
  const handleStartLearning = async (mode: 'srs' | 'sequential' = 'srs', sequenceAction?: 'continue' | 'restart') => { if (!id) return; try { const result = await api.post('/sessions', { folderId: id, mode, sequenceAction }); navigate(`/sessions/${result.data._id}`) } catch (error: any) { toast.error(error.response?.data?.code === 'NOTHING_DUE' ? 'Bạn đã hoàn thành lịch học hôm nay.' : 'Không thể tạo session học.') } }
  const handleStartRetrySession = async (wordIds: string[]) => { if (!id) return; try { const result = await api.post('/sessions', { folderId: id, mode: 'retry', wordIds }); navigate(`/sessions/${result.data._id}`) } catch { toast.error('Không thể tạo session ôn tập.') } }
  const handleImportJobCreated = (jobId: string) => { setActiveJobId(jobId); setIsImportDrawerOpen(true) }
  const handleJobFinished = (job: ImportJob) => { job.status === 'DONE' ? toast.success('Import hoàn tất', { description: `Đã nhập ${job.counters.createdCount + job.counters.updatedCount} dòng.` }) : toast.error('Import thất bại'); fetchWords(); fetchFolder() }
  return { id, folder, words, total, loading, error, page, limit, totalPages: Math.ceil(total / limit), searchQuery, posFilter, isAddDialogOpen, editingWord, isUploadDialogOpen, isImportDrawerOpen, activeJobId, activeTab, folderStats, statsLoading, setPage, setSearchQuery, setPosFilter, setIsAddDialogOpen, setEditingWord, setIsUploadDialogOpen, setIsImportDrawerOpen, setActiveTab, handleAddWord, handleUpdateWord, handleDeleteWord, handleStartLearning, handleStartRetrySession, handleImportJobCreated, handleJobFinished, fetchWords, fetchFolder, navigate, location }
}
