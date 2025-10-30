import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Folder } from './FolderList'

type FolderDetailHeaderProps = {
  folder: Folder | null
  onStartLearning: () => void
  onOpenUpload: () => void
  onOpenAddWord: () => void
  canStart: boolean
  onBackToFolders: () => void
}

const FolderDetailHeader: React.FC<FolderDetailHeaderProps> = ({
  folder,
  onStartLearning,
  onOpenUpload,
  onOpenAddWord,
  canStart,
  onBackToFolders
}) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="sm" onClick={onBackToFolders}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Danh sách folder
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{folder?.name || 'Loading...'}</h1>
          {folder?.description && <p className="text-gray-600 mt-2">{folder.description}</p>}
          <p className="text-sm text-gray-500 mt-2">
            Tổng số từ: <span className="font-semibold">{folder?.stats?.totalWords || 0}</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-end">
        <Button
          onClick={onStartLearning}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!canStart}
        >
          🎯 Bắt đầu học
        </Button>
        <Button variant="outline" onClick={onOpenUpload}>
          ⬆️ Upload file
        </Button>
        <Button variant="outline" onClick={onOpenAddWord}>
          + Thêm từ mới
        </Button>
      </div>
    </div>
  </div>
)

export default FolderDetailHeader
