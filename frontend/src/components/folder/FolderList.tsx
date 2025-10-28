// src/components/folder/FolderList.tsx
import { useNavigate } from "react-router"
import FolderCard, { type FolderCardProps } from "./FolderCard"
import CreateFolderCard from "./CreateFolderCard"

export type Folder = {
  _id: string
  name: string
  stats?: {
    totalWords?: number
    mastered?: number
  }
  owner?: string
}

export type FolderListProps = {
  folders: Folder[]
  onCreate?: () => void
  onDelete?: (folderId: string) => void
  onEdit?: (folder: Folder) => void
}

export default function FolderList({ folders, onCreate, onDelete, onEdit }: FolderListProps) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-4">
      <CreateFolderCard onCreate={onCreate} />
      {folders.map((f) => {
        const props: FolderCardProps = {
          name: f.name,
          totalWords: f.stats?.totalWords ?? 0,
          mastered: f.stats?.mastered ?? 0,
          owner: f.owner ?? "You",
          onClick: () => navigate(`/folders/${f._id}`),
          onEdit: () => onEdit?.(f),
          onDelete: () => onDelete?.(f._id),
        }
        return <FolderCard key={f._id} {...props} />
      })}
    </div>
  )
}
