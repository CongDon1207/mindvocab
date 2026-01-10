// src/components/folder/FolderList.tsx
import { useNavigate } from "react-router"
import FolderCard, { type FolderCardProps } from "./FolderCard"
import CreateFolderCard from "./CreateFolderCard"

export type Folder = {
  _id: string
  name: string
  description?: string
  stats?: {
    totalWords?: number
    mastered?: number
  }
  nextReviewDate?: string | null
  owner?: string
  createdAt?: string
  updatedAt?: string
}

export type FolderListProps = {
  folders: Folder[]
  onCreate?: () => void
  onDelete?: (folderId: string) => void
  onEdit?: (folder: Folder) => void
  onScheduleReview?: (folderId: string, days: number | null) => void
}

export default function FolderList({ folders, onCreate, onDelete, onEdit, onScheduleReview }: FolderListProps) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <CreateFolderCard onCreate={onCreate} />
      {folders.map((f) => {
        const props: FolderCardProps = {
          name: f.name,
          totalWords: f.stats?.totalWords ?? 0,
          mastered: f.stats?.mastered ?? 0,
          owner: f.owner ?? "You",
          nextReviewDate: f.nextReviewDate,
          onClick: () => navigate(`/folders/${f._id}`),
          onEdit: () => onEdit?.(f),
          onDelete: () => onDelete?.(f._id),
          onScheduleReview: (days) => onScheduleReview?.(f._id, days),
        }
        return <FolderCard key={f._id} {...props} />
      })}
    </div>
  )
}
