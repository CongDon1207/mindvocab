// src/components/session/SessionHeader.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap } from 'lucide-react'

interface SessionHeaderProps {
  folderName: string
  stepLabel: string
  totalWords: number
  progressPercentage: number
  onBackToFolder?: () => void
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  folderName,
  stepLabel,
  totalWords,
  progressPercentage,
  onBackToFolder
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {onBackToFolder && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToFolder}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Về folder
            </Button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {folderName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {stepLabel}
              </span>
              <span className="text-sm text-slate-500">
                {totalWords} từ
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-bold text-slate-800">{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionHeader
