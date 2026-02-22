// src/components/notebook/NotebookCard.tsx
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BookOpen, Layers, MoreVertical, CalendarClock, Clock, CalendarPlus, Trash2, Play, CalendarX } from "lucide-react"
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

export type NotebookCardProps = {
  id: string
  title: string
  content?: string
  exerciseCount?: number
  stage?: number
  nextReviewDate?: string | Date | null
  onClick?: () => void
  onStartReview?: () => void
  onDelete?: () => void
  onScheduleReview?: (days: number | null) => void
}

// Helper function to calculate days until review
function getDaysUntilReview(nextReviewDate: string | Date | null | undefined): number | null {
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

// Helper to get stage color
function getStageStyle(stage: number): string {
  const styles: Record<number, string> = {
    0: "bg-slate-100 text-slate-600",
    1: "bg-emerald-100 text-emerald-600",
    2: "bg-sky-100 text-sky-600",
    3: "bg-indigo-100 text-indigo-600",
    4: "bg-violet-100 text-violet-600",
    5: "bg-fuchsia-100 text-fuchsia-600",
  }
  return styles[stage] || styles[0]
}

export default function NotebookCard({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  title,
  content,
  exerciseCount = 0,
  stage = 0,
  nextReviewDate,
  onClick,
  onStartReview,
  onDelete,
  onScheduleReview,
}: NotebookCardProps) {
  const daysUntil = getDaysUntilReview(nextReviewDate)
  const reviewStatus = getReviewStatus(daysUntil)
  const isDue = daysUntil !== null && daysUntil <= 0

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
              {title}
            </CardTitle>
            {content && (
              <p className="text-sm text-slate-500 line-clamp-2 mt-1">{content}</p>
            )}
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
              {onStartReview && exerciseCount > 0 && (
                <>
                  <DropdownMenuItem onClick={onStartReview} className="cursor-pointer rounded-lg">
                    <Play className="mr-2 h-4 w-4 text-emerald-500" />
                    Bắt đầu ôn tập
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
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

              {reviewStatus && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleSchedule(null)} 
                    className="cursor-pointer rounded-lg text-slate-500"
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Đặt về "Cần ôn ngay"
                  </DropdownMenuItem>
                </>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="cursor-pointer rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa sổ tay
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
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1.5 text-sm bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-bold">{exerciseCount}</span>
            <span className="text-xs text-sky-500">câu hỏi</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg ${getStageStyle(stage)}`}>
            <Layers className="h-3.5 w-3.5" />
            <span className="font-bold">Stage {stage}</span>
          </div>
        </div>

        {/* Progress bar for stage visualization */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Tiến độ SRS</span>
            <span className="text-violet-600 font-bold">{Math.round((stage / 5) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className="h-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(232,121,249,0.5)]"
              style={{ width: `${(stage / 5) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-0 pb-4 flex items-center justify-between relative z-10">
        {isDue && exerciseCount > 0 ? (
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onStartReview?.()
            }}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl shadow-md"
          >
            <Play className="h-3.5 w-3.5 mr-1.5 fill-white" />
            Ôn ngay
          </Button>
        ) : (
          <div className="text-xs text-slate-400">
            {nextReviewDate && (
              <span>Ôn: {new Date(nextReviewDate).toLocaleDateString('vi-VN')}</span>
            )}
          </div>
        )}
      </CardFooter>

      {/* Custom Days Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-violet-900">Đặt lịch ôn tập</DialogTitle>
            <DialogDescription>
              Nhập số ngày bạn muốn ôn lại sổ tay này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-days-notebook" className="text-right font-medium">
                Số ngày
              </Label>
              <Input
                id="custom-days-notebook"
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
