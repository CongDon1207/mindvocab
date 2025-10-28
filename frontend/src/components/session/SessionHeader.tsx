// src/components/session/SessionHeader.tsx
import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'

interface SessionHeaderProps {
  folderName: string
  stepLabel: string
  totalWords: number
  progressPercentage: number
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  folderName,
  stepLabel,
  totalWords,
  progressPercentage
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {folderName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {stepLabel} • {totalWords} từ
            </p>
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
