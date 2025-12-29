// src/components/CreateFolderCard.tsx
import { Card, CardHeader } from "@/components/ui/card"
import { Plus, Sparkles } from "lucide-react"

export type CreateFolderCardProps = {
  onCreate?: () => void
}

export default function CreateFolderCard({ onCreate }: CreateFolderCardProps) {
  return (
    <Card
      onClick={onCreate}
      className="group relative w-full cursor-pointer bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-indigo-50/50 border-2 border-dashed border-slate-200 hover:border-blue-300 transition-all duration-300 rounded-2xl overflow-hidden min-h-[200px] flex items-center justify-center"
      role="button"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,_#000_1px,_transparent_0)] bg-[length:20px_20px]" />
      
      <CardHeader className="relative flex flex-col items-center justify-center gap-3 py-8">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300">
            <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="text-center px-4">
          <span className="block text-base font-semibold text-slate-700 group-hover:text-blue-600 transition-colors whitespace-nowrap">
            Tạo thư mục mới
          </span>
          <span className="block text-xs text-slate-400 mt-1 whitespace-nowrap">
            Bắt đầu học ngay
          </span>
        </div>
      </CardHeader>
    </Card>
  )
}
