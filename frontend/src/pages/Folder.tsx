import FolderList, { type Folder } from '@/components/FolderList'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import CreateFolderDialog, { type CreateFolderValues } from '@/components/CreateFolderDialog'
import api from '@/lib/axios'

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

  // ========== LIFECYCLE ==========
  // Tải danh sách folder khi component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await api.get<Folder[]>("/folders")
        setFolders(res.data || [])
      } catch (error) {
        console.error("Lỗi khi tải danh sách folder:", error)
        setFolders([])
      }
    }
    fetchFolders()
  }, [])

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

  // ========== RENDER ==========
  return (
    <div className='bg-blue-200 min-h-screen p-8'>
      <div className='flex flex-col items-center gap-6'>
        {/* Danh sách folders */}
        <FolderList 
          folders={currentFolders} 
          onCreate={handleOpenCreateDialog}
          onDelete={handleDeleteFolder}
          onEdit={handleOpenEditDialog}
        />

        {/* Điều khiển phân trang */}
        {totalPages > 1 && (
          <div className='flex items-center gap-4'>
            <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
              Trang trước
            </Button>
            <span className='text-sm font-medium'>
              Trang {currentPage} / {totalPages}
            </span>
            <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Trang sau
            </Button>
          </div>
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
    </div>
  )
}

export default Folder
