// src/components/session/SessionStepper.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { SessionStep } from '@/types/session'

interface SessionStepperProps {
  steps: SessionStep[]
  stepLabels: Record<SessionStep, string>
  currentStepIndex: number
  progressPercentage: number
}

const SessionStepper: React.FC<SessionStepperProps> = ({
  steps,
  stepLabels,
  currentStepIndex,
  progressPercentage
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex
            const isUpcoming = index > currentStepIndex

            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div
                  className={`
                    text-xs mt-2 text-center font-medium max-w-20
                    ${isActive ? 'text-blue-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isUpcoming ? 'text-gray-500' : ''}
                  `}
                >
                  {stepLabels[step]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionStepper
