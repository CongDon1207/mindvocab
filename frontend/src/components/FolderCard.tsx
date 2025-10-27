// src/components/FolderCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Square, PenLine } from "lucide-react"

export type FolderCardProps = {
  name: string
  totalWords?: number
  mastered?: number
  owner?: string
  onClick?: () => void
}

export default function FolderCard({
  name,
  totalWords = 0,
  mastered = 0,
  owner = "You",
  onClick,
}: FolderCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-[250px] cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
      role="button"
    >
      <CardHeader className='flex flex-col items-center justify-center'>
        <CardTitle className="line-clamp-1 text-base">{name}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-gray-600">
          <Square className="h-4 w-4" />
          {totalWords} từ
          <>
            <span className="text-gray-300">|</span>
            <PenLine className="h-4 w-4" />
            {mastered}
          </>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex items-center justify-center gap-2">
        <div className="size-7 rounded-full bg-gray-200 grid place-items-center text-gray-700 text-sm font-semibold">
          {owner?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="text-sm text-gray-700">{owner}</span>
      </CardFooter>
    </Card>
  )
}
