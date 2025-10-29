import React from 'react'
import { Button } from '@/components/ui/button'
import type { Folder } from './FolderList'

type FolderDetailHeaderProps = {
  folder: Folder | null
  onStartLearning: () => void
  onOpenUpload: () => void
  onOpenAddWord: () => void
  canStart: boolean
}

const FolderDetailHeader: React.FC<FolderDetailHeaderProps> = ({
  folder,
  onStartLearning,
  onOpenUpload,
  onOpenAddWord,
  canStart,
}) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{folder?.name || 'Loading...'}</h1>
        {folder?.description && <p className="text-gray-600 mt-2">{folder.description}</p>}
        <p className="text-sm text-gray-500 mt-2">
          Tổng số từ: <span className="font-semibold">{folder?.stats?.totalWords || 0}</span>
        </p>
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

