// src/components/session/SessionLoading.tsx
import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

const STEP_COUNT = 6

const SessionLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          </CardHeader>
        </Card>
        
        {/* Stepper Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-4">
              {Array.from({ length: STEP_COUNT }).map((_, i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SessionLoading
