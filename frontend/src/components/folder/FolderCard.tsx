// src/components/folder/FolderCard.tsx
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BookOpen, Trophy, Edit2, Trash2, MoreVertical, CalendarClock, CalendarX, Clock, CalendarPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export type FolderCardProps = {
  name: string
  totalWords?: number
  mastered?: number
  owner?: string
  nextReviewDate?: string | null
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onScheduleReview?: (days: number | null) => void
}

// Helper function to calculate days until review
function getDaysUntilReview(nextReviewDate: string | null | undefined): number | null {
  if (!nextReviewDate) return null
  const now = new Date()
  const reviewDate = new Date(nextReviewDate)
  const diffMs = reviewDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Helper function to format review status
function getReviewStatus(daysUntil: number | null): { text: string; color: string; bgColor: string } | null {
  if (daysUntil === null) return null
  
  if (daysUntil <= 0) {
    return { text: "Cần ôn ngay!", color: "text-rose-600", bgColor: "bg-rose-100 border-rose-200" }
  } else if (daysUntil === 1) {
    return { text: "Ôn vào ngày mai", color: "text-orange-600", bgColor: "bg-orange-100 border-orange-200" }
  } else if (daysUntil <= 3) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-amber-600", bgColor: "bg-amber-100 border-amber-200" }
  } else if (daysUntil <= 7) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-sky-600", bgColor: "bg-sky-100 border-sky-200" }
  } else if (daysUntil <= 14) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-indigo-600", bgColor: "bg-indigo-100 border-indigo-200" }
  } else if (daysUntil <= 30) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-violet-600", bgColor: "bg-violet-100 border-violet-200" }
  } else {
    return { text: `Còn ${daysUntil} ngày`, color: "text-slate-600", bgColor: "bg-slate-100 border-slate-200" }
  }
}

export default function FolderCard({
  name,
  totalWords = 0,
  mastered = 0,
  owner = "You",
  nextReviewDate,
  onClick,
  onEdit,
  onDelete,
  onScheduleReview,
}: FolderCardProps) {
  const masteryPercent = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0
  const daysUntil = getDaysUntilReview(nextReviewDate)
  const reviewStatus = getReviewStatus(daysUntil)

  // Custom days dialog state
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false)
  const [customDays, setCustomDays] = useState("")

  const handleSchedule = (days: number | null) => {
    if (onScheduleReview) {
      onScheduleReview(days)
    }
  }

  const handleCustomSchedule = () => {
    const days = parseInt(customDays)
    if (!isNaN(days) && days > 0) {
      handleSchedule(days)
      setIsCustomDialogOpen(false)
      setCustomDays("")
    } else {
      alert("Vui lòng nhập số ngày hợp lệ (lớn hơn 0)")
    }
  }

  return (
    <Card
      onClick={onClick}
      className="group relative w-full cursor-pointer bg-white/70 backdrop-blur-xl border border-white shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 rounded-3xl overflow-hidden"
      role="button"
    >
      {/* Decorative Gradient Blob on Hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-slate-700 truncate group-hover:text-violet-600 transition-colors">
              {name}
            </CardTitle>
          </div>
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1 hover:bg-violet-50 hover:text-violet-600"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer rounded-lg">
                  <Edit2 className="mr-2 h-4 w-4 text-sky-500" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Đặt lịch ôn tập
              </DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => handleSchedule(1)} className="cursor-pointer rounded-lg">
                <Clock className="mr-2 h-4 w-4 text-orange-500" />
                Ngày mai
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(3)} className="cursor-pointer rounded-lg">
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                3 ngày tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(7)} className="cursor-pointer rounded-lg">
                <Clock className="mr-2 h-4 w-4 text-sky-500" />
                1 tuần tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(14)} className="cursor-pointer rounded-lg">
                <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                2 tuần tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(30)} className="cursor-pointer rounded-lg">
                <Clock className="mr-2 h-4 w-4 text-violet-500" />
                1 tháng tới
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCustomDialogOpen(true)
                }} 
                className="cursor-pointer rounded-lg"
              >
                <CalendarPlus className="mr-2 h-4 w-4 text-emerald-500" />
                Tùy chỉnh số ngày...
              </DropdownMenuItem>
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="cursor-pointer rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa thư mục
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Review Status Badge */}
        {reviewStatus && (
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${reviewStatus.bgColor} ${reviewStatus.color}`}>
            <CalendarClock className="h-3 w-3" />
            {reviewStatus.text.toUpperCase()}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm bg-sky-50 text-sky-700 px-2 py-1 rounded-lg">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-bold">{totalWords}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-bold">{mastered}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Tiến độ</span>
            <span className="text-violet-600 font-bold">{masteryPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(232,121,249,0.5)]"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0 pb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600 text-xs font-black">
              {owner?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">{owner}</span>
        </div>
      </CardFooter>

      {/* Custom Days Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-900">Đặt lịch ôn tập</DialogTitle>
            <DialogDescription>
              Nhập số ngày bạn muốn ôn lại thư mục này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-days" className="text-right font-medium">
                Số ngày
              </Label>
              <Input
                id="custom-days"
                type="number"
                min="1"
                placeholder="Ví dụ: 5"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSchedule()
                  }
                }}
                className="col-span-3 rounded-xl border-slate-200 focus-visible:ring-violet-500"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsCustomDialogOpen(false)
                setCustomDays("")
              }}
              className="rounded-xl border-slate-200"
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleCustomSchedule} className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}