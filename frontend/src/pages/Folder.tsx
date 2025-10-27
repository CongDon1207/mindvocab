import FolderList, { type Folder } from '@/components/FolderList'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import CreateFolderDialog, { type CreateFolderValues } from '@/components/CreateFolderDialog'
import api from '@/lib/axios'

const Folder: React.FC = () => {
  // Mock data cho folders
  const [folders, setFolders] = useState<Folder[]>([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const foldersPerPage = 7
  const totalPages = Math.ceil((folders?.length || 0) / foldersPerPage)
  const startIndex = (currentPage - 1) * foldersPerPage
  const endIndex = startIndex + foldersPerPage
  const currentFolders = folders?.slice(startIndex, endIndex) || []

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))

  // ✅ Cách 2 — rõ nghiệp vụ
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true)

  const fetchFolder = async () => {
    try {
      const res = await api.get<Folder[]>("/folders");
      setFolders(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách folder:", error);
      setFolders([]); // fallback to empty array
    }
  }

  useEffect(() => {
    fetchFolder();
  }, [])

  // Submit form → thêm folder mới
  const handleSubmitCreate = async (values: CreateFolderValues) => {
    try {
      const res = await api.post<Folder>("/folders", values);
      const newFolder: Folder = res.data;  // backend trả về folder mới tạo
      setFolders(prev => [newFolder, ...prev]);  // thêm vào đầu danh sách
      setCurrentPage(1);  // chuyển về trang 1 để thấy item mới
      setIsCreateDialogOpen(false);  // đóng dialog sau khi thành công
    } catch (err: any) {
      console.error("Tạo folder thất bại:", err);
      alert(err.response?.data?.error || "Không thể tạo folder mới.");
    }
  }


  return (
    <div className='bg-blue-200 min-h-screen p-8'>
      <div className='flex flex-col items-center gap-6'>
        <FolderList folders={currentFolders} onCreate={handleOpenCreateDialog} />

        {/* Pagination Controls */}
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

        {/* Dialog tạo folder */}
        <CreateFolderDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleSubmitCreate}
        />
      </div>
    </div>
  )
}

export default Folder
