// src/components/FolderList.tsx
import { useNavigate } from "react-router"
import FolderCard, { type FolderCardProps } from "@/components/FolderCard"
import CreateFolderCard from "@/components/CreateFolderCard.tsx"

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
}

export default function FolderList({ folders, onCreate }: FolderListProps) {
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
        }
        return <FolderCard key={f._id} {...props} />
      })}
    </div>
  )
}
