// src/components/session/SessionNavigation.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SessionNavigationProps {
  currentStepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  continueEnabled: boolean
  onBack: () => void
  onContinue: () => void
}

const SessionNavigation: React.FC<SessionNavigationProps> = ({
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  continueEnabled,
  onBack,
  onContinue
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep}
          >
            ← Quay lại
          </Button>

          <div className="text-sm text-gray-600">
            Bước {currentStepIndex + 1} / {totalSteps}
          </div>

          <Button
            onClick={onContinue}
            disabled={!continueEnabled}
          >
            {isLastStep ? 'Hoàn thành' : 'Tiếp tục →'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SessionNavigation
