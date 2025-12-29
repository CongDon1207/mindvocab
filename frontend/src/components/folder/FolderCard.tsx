// src/components/FolderCard.tsx
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BookOpen, Trophy, Edit2, Trash2 } from "lucide-react"

export type FolderCardProps = {
  name: string
  totalWords?: number
  mastered?: number
  owner?: string
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function FolderCard({
  name,
  totalWords = 0,
  mastered = 0,
  owner = "You",
  onClick,
  onEdit,
  onDelete,
}: FolderCardProps) {
  const masteryPercent = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0

  return (
    <Card
      onClick={onClick}
      className="group relative w-full cursor-pointer bg-white/80 backdrop-blur-sm border-slate-200/60 hover:border-blue-300/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl overflow-hidden"
      role="button"
    >
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
              {name}
            </CardTitle>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{totalWords}</span>
            <span className="text-slate-400">từ</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{mastered}</span>
            <span className="text-slate-400">thuộc</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tiến độ</span>
            <span className="font-medium text-slate-700">{masteryPercent}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-xs font-semibold shadow-sm">
            {owner?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-sm text-slate-600">{owner}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="h-4 w-4 text-blue-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
