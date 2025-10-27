// src/components/CreateFolderCard.tsx
import { Card, CardHeader } from "@/components/ui/card"
import { Plus } from "lucide-react"

export type CreateFolderCardProps = {
  onCreate?: () => void
}

export default function CreateFolderCard({ onCreate }: CreateFolderCardProps) {
  return (
    <Card
      onClick={onCreate}
      className="w-[250px] cursor-pointer hover:shadow-md transition-shadow rounded-2xl border-dashed border-2 flex items-center justify-center min-h-[180px]"
      role="button"
    >
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <div className="size-12 rounded-full bg-primary/10 grid place-items-center">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          Tạo folder mới
        </span>
      </CardHeader>
    </Card>
  )
}
