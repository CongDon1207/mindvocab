// src/components/session/SessionHeader.tsx
import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

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
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {onBackToFolder && (
              <Button variant="outline" size="sm" onClick={onBackToFolder}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Về folder
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {folderName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {stepLabel} • {totalWords} từ
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{progressPercentage}%</div>
            <div className="text-xs text-gray-500">Tiến độ</div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

export default SessionHeader
