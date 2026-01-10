import { FolderList, CreateFolderDialog, ReviewDashboard, type FolderReviewStats } from '@/components/folder'
import type { Folder, CreateFolderValues } from '@/components/folder'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { LayoutGrid, CalendarClock } from 'lucide-react'

const Folder: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  // Danh sách folders từ server
  const [folders, setFolders] = useState<Folder[]>([])

  // Quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const foldersPerPage = 7
  const totalPages = Math.ceil(folders.length / foldersPerPage)
  const startIndex = (currentPage - 1) * foldersPerPage
  const currentFolders = folders.slice(startIndex, startIndex + foldersPerPage)

  // Quản lý dialog tạo mới
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Quản lý dialog chỉnh sửa
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)

  const [activeTab, setActiveTab] = useState<'list' | 'review'>('list')
  const [reviewDashboardData, setReviewDashboardData] = useState<FolderReviewStats[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // ========== LIFECYCLE ==========
  // Tải danh sách folder khi component mount
  useEffect(() => {
    fetchFolders()
    fetchReviewDashboard()
  }, [])

  const fetchFolders = async () => {
    try {
      const res = await api.get<Folder[]>("/folders")
      const data = Array.isArray(res.data) ? res.data : []
      setFolders(data)
    } catch (error) {
      console.error("Lỗi khi tải danh sách folder:", error)
      setFolders([])
    }
  }

  const fetchReviewDashboard = async () => {
    setDashboardLoading(true)
    try {
      const res = await api.get<FolderReviewStats[]>("/folders/review-dashboard")
      setReviewDashboardData(res.data)
    } catch (error) {
      console.error("Lỗi khi tải dashboard ôn tập:", error)
    } finally {
      setDashboardLoading(false)
    }
  }

  // ========== HANDLERS - PHÂN TRANG ==========
  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))

  // ========== HANDLERS - TẠO MỚI ==========
  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true)

  const handleSubmitCreate = async (values: CreateFolderValues) => {
    try {
      const res = await api.post<Folder>("/folders", values)
      setFolders(prev => [res.data, ...prev])
      setCurrentPage(1)
      setIsCreateDialogOpen(false)
    } catch (err: any) {
      console.error("Tạo folder thất bại:", err)
      alert(err.response?.data?.error || "Không thể tạo folder mới.")
    }
  }

  // ========== HANDLERS - CHỈNH SỬA ==========
  const handleOpenEditDialog = (folder: Folder) => {
    setEditingFolder(folder)
    setIsEditDialogOpen(true)
  }

  const handleSubmitEdit = async (values: CreateFolderValues) => {
    if (!editingFolder) return
    try {
      const res = await api.put<Folder>(`/folders/${editingFolder._id}`, values)
      setFolders(prev => prev.map(f => f._id === editingFolder._id ? res.data : f))
      setIsEditDialogOpen(false)
      setEditingFolder(null)
      alert('Thư mục đã được cập nhật thành công')
    } catch (err: any) {
      console.error("Cập nhật folder thất bại:", err)
      alert(err.response?.data?.error || "Không thể cập nhật folder.")
    }
  }

  // ========== HANDLERS - XÓA ==========
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa thư mục này?')) return
    try {
      await api.delete(`/folders/${folderId}`)
      setFolders(prev => prev.filter(f => f._id !== folderId))
      alert('Thư mục đã được xóa thành công')
    } catch (err: any) {
      console.error("Xóa folder thất bại:", err)
      alert(err.response?.data?.error || "Không thể xóa folder.")
    }
  }

  // ========== HANDLERS - LÊN LỊCH ÔN TẬP ==========
  const handleScheduleReview = async (folderId: string, days: number | null) => {
    try {
      // Find the folder to get its current name (required for update API)
      const folder = folders.find(f => f._id === folderId)
      if (!folder) return

      // Calculate nextReviewDate
      let nextReviewDate: string | null = null
      if (days !== null) {
        const reviewDate = new Date()
        reviewDate.setDate(reviewDate.getDate() + days)
        reviewDate.setHours(0, 0, 0, 0) // Set to start of day
        nextReviewDate = reviewDate.toISOString()
      }

      // Update folder with new review date
      const res = await api.put<Folder>(`/folders/${folderId}`, {
        name: folder.name,
        description: folder.description || '',
        nextReviewDate
      })

      // Update local state
      setFolders(prev => prev.map(f => f._id === folderId ? res.data : f))
      
      // Refresh dashboard data
      fetchReviewDashboard()

      // Show feedback
      if (days !== null) {
        alert(`Đã đặt lịch ôn tập sau ${days} ngày`)
      } else {
        alert('Đã gỡ lịch ôn tập')
      }
    } catch (err: any) {
      console.error("Đặt lịch ôn tập thất bại:", err)
      alert(err.response?.data?.error || "Không thể đặt lịch ôn tập.")
    }
  }

  // ========== HANDLERS - RESET TIẾN ĐỘ ==========
  const handleResetProgress = async (folderId: string) => {
    try {
      await api.post(`/folders/${folderId}/reset-progress`)
      
      // Refresh both folders list and dashboard
      fetchFolders()
      fetchReviewDashboard()
      
      alert('Đã reset tiến độ học. Tất cả từ trong thư mục đã trở về trạng thái chưa học.')
    } catch (err: any) {
      console.error("Reset tiến độ thất bại:", err)
      alert(err.response?.data?.error || "Không thể reset tiến độ học.")
    }
  }

  // ========== RENDER ==========
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Thư mục của bạn
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý và học từ vựng theo chủ đề
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="px-3 py-1 rounded-full bg-slate-100">
            {folders.length} thư mục
          </span>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 w-fit rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'list'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Thư mục của bạn
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all relative ${activeTab === 'review'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <CalendarClock className="h-4 w-4" />
          Lịch ôn tập
          {reviewDashboardData.some(f => f.category === 'overdue') && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-slate-100"></span>
          )}
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Danh sách folders */}
          <FolderList
            folders={currentFolders}
            onCreate={handleOpenCreateDialog}
            onDelete={handleDeleteFolder}
            onEdit={handleOpenEditDialog}
            onScheduleReview={handleScheduleReview}
          />

          {/* Điều khiển phân trang */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="shadow-sm"
              >
                ← Trang trước
              </Button>
              <span className="px-4 py-2 rounded-lg bg-white shadow-sm border border-slate-200 text-sm font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="shadow-sm"
              >
                Trang sau →
              </Button>
            </div>
          )}
        </>
      ) : (
        <ReviewDashboard 
          data={reviewDashboardData} 
          loading={dashboardLoading}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* Dialog tạo folder mới */}
      <CreateFolderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleSubmitCreate}
      />

      {/* Dialog chỉnh sửa folder */}
      {editingFolder && (
        <CreateFolderDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleSubmitEdit}
          defaultValues={{ name: editingFolder.name, description: '' }}
          title="Chỉnh sửa thư mục"
          submitButtonText="Cập nhật"
        />
      )}
    </div>
  )
}

export default Folder
