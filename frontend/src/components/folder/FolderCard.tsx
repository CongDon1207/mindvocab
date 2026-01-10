// src/components/FolderCard.tsx
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
    return { text: "Cần ôn ngay!", color: "text-red-600", bgColor: "bg-red-50 border-red-200" }
  } else if (daysUntil === 1) {
    return { text: "Ôn vào ngày mai", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" }
  } else if (daysUntil <= 3) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" }
  } else if (daysUntil <= 7) {
    return { text: `Còn ${daysUntil} ngày`, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" }
  } else {
    return { text: `Còn ${daysUntil} ngày`, color: "text-slate-600", bgColor: "bg-slate-50 border-slate-200" }
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
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
              >
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4 text-blue-500" />
                  Chỉnh sửa
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" />
                Đặt lịch ôn tập
              </DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => handleSchedule(1)} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-orange-500" />
                Ngày mai
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(3)} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                3 ngày tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(7)} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-blue-500" />
                1 tuần tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(14)} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                2 tuần tới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSchedule(30)} className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4 text-purple-500" />
                1 tháng tới
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCustomDialogOpen(true)
                }} 
                className="cursor-pointer"
              >
                <CalendarPlus className="mr-2 h-4 w-4 text-emerald-500" />
                Tùy chỉnh số ngày...
              </DropdownMenuItem>
              
              {nextReviewDate && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleSchedule(null)} 
                    className="cursor-pointer text-slate-500"
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Gỡ lịch ôn tập
                  </DropdownMenuItem>
                </>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
          <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${reviewStatus.bgColor} ${reviewStatus.color}`}>
            <CalendarClock className="h-3 w-3" />
            {reviewStatus.text}
          </div>
        )}
        
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
      </CardFooter>

      {/* Custom Days Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Đặt lịch ôn tập tùy chỉnh</DialogTitle>
            <DialogDescription>
              Nhập số ngày bạn muốn ôn lại thư mục này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="custom-days" className="text-right">
                Số ngày
              </Label>
              <Input
                id="custom-days"
                type="number"
                min="1"
                placeholder="Ví dụ: 5, 10, 15..."
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSchedule()
                  }
                }}
                className="col-span-3"
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
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleCustomSchedule}>
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
