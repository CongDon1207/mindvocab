import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
      <div className="text-sm text-slate-500">
        Hiển thị <span className="font-medium text-slate-700">{start} - {end}</span> / <span className="font-medium text-slate-700">{total}</span> từ
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </Button>
        <span className="px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-200 font-medium text-slate-700 shadow-sm">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="shadow-sm"
        >
          Sau
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default FolderPagination

