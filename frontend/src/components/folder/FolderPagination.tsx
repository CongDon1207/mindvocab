import React from 'react'
import { Button } from '@/components/ui/button'

type FolderPaginationProps = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

const FolderPagination: React.FC<FolderPaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="px-6 py-4 border-t flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Hiển thị {start} - {end} / {total} từ
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Trước
        </Button>
        <span className="px-3 py-1 text-sm">
          Trang {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}

export default FolderPagination

