
import FolderList, { type Folder } from '@/components/FolderList'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import CreateFolderDialog, { type CreateFolderValues } from '@/components/CreateFolderDialog'

const Folder: React.FC = () => {
  // Mock data cho folders
  const [folders, setFolders] = useState<Folder[]>([
    {
      _id: '1',
      name: 'Từ vựng Tiếng Anh Cơ bản',
      stats: {
        totalWords: 150,
        mastered: 45
      },
      owner: 'Nguyễn Văn A'
    },
    {
      _id: '2',
      name: 'IELTS Vocabulary',
      stats: {
        totalWords: 200,
        mastered: 120
      },
      owner: 'Trần Thị B'
    },
    {
      _id: '3',
      name: 'Business English',
      stats: {
        totalWords: 80,
        mastered: 25
      },
      owner: 'Lê Văn C'
    },
    {
      _id: '4',
      name: 'Technical Terms',
      stats: {
        totalWords: 95,
        mastered: 60
      },
      owner: 'Phạm Thị D'
    },
    {
      _id: '5',
      name: 'Daily Conversation',
      stats: {
        totalWords: 120,
        mastered: 85
      },
      owner: 'Hoàng Văn E'
    },
    {
      _id: '6',
      name: 'Academic Words',
      stats: {
        totalWords: 180,
        mastered: 95
      },
      owner: 'Đỗ Thị F'
    },
    {
      _id: '7',
      name: 'Idioms & Phrases',
      stats: {
        totalWords: 75,
        mastered: 30
      },
      owner: 'Vũ Văn G'
    },
    {
      _id: '8',
      name: 'TOEIC Preparation',
      stats: {
        totalWords: 110,
        mastered: 70
      },
      owner: 'Bùi Văn H'
    },
    {
      _id: '9',
      name: 'Medical Terms',
      stats: {
        totalWords: 200,
        mastered: 45
      },
      owner: 'Ngô Thị I'
    },
    {
      _id: '10',
      name: 'Legal Vocabulary',
      stats: {
        totalWords: 90,
        mastered: 55
      },
      owner: 'Đinh Văn K'
    }
  ])

  // Phân trang: 2 hàng x 4 cột = 8 folders/trang
  const [currentPage, setCurrentPage] = useState(1)
  const foldersPerPage = 7;
  const totalPages = Math.ceil(folders.length / foldersPerPage)

  // Lấy folders cho trang hiện tại
  const startIndex = (currentPage - 1) * foldersPerPage
  const endIndex = startIndex + foldersPerPage
  const currentFolders = folders.slice(startIndex, endIndex)

  const handleCreateFolder = () => {
    const newFolder: Folder = {
      _id: Date.now().toString(),
      name: `Folder mới ${folders.length + 1}`,
      stats: {
        totalWords: 0,
        mastered: 0
      },
      owner: 'You'
    }
    setFolders(prev => [...prev, newFolder])
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const [openCreate, setOpenCreate] = useState(false)

  // NEW: mở dialog khi bấm CreateFolderCard
  const handleOpenCreate = () => setOpenCreate(true)

  // NEW: submit form → thêm folder mới (mock). Sau này gọi API POST /api/folders
  const handleSubmitCreate = (values: CreateFolderValues) => {
    const newFolder: Folder = {
      _id: Date.now().toString(),
      name: values.name,
      stats: { totalWords: 0, mastered: 0 },
      owner: 'You',
      // nếu bạn muốn lưu description ở UI, có thể mở rộng type Folder để có description
      // description: values.description ?? ''
    }
    setFolders(prev => [newFolder, ...prev])
    // có thể setCurrentPage(1) để thấy item mới ở đầu
  }

  return (
    <div className='bg-blue-200 min-h-screen p-8'>
      <div className='flex flex-col items-center gap-6'>
        <FolderList folders={currentFolders} onCreate={handleOpenCreate} />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className='flex items-center gap-4'>
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Trang trước
            </Button>

            <span className='text-sm font-medium'>
              Trang {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Trang sau
            </Button>
          </div>
        )}

        {/* NEW: Dialog tạo folder */}
        <CreateFolderDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          onSubmit={handleSubmitCreate}
        />
      </div>
    </div>
  )
}

export default Folder