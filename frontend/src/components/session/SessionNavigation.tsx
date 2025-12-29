// src/components/session/SessionNavigation.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, SkipForward, CheckCircle } from 'lucide-react'

interface SessionNavigationProps {
  currentStepIndex: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  continueEnabled: boolean
  onBack: () => void
  onContinue: () => void
  onSkip?: () => void
}

const SessionNavigation: React.FC<SessionNavigationProps> = ({
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  continueEnabled,
  onBack,
  onContinue,
  onSkip
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Back button */}
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isFirstStep}
          className="shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Quay lại
        </Button>

        {/* Center section */}
        <div className="flex items-center gap-3">
          {/* Skip button */}
          {onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip} 
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              <SkipForward className="w-4 h-4 mr-1.5" />
              Bỏ qua
            </Button>
          )}
          
          {/* Step indicator */}
          <div className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-600">
            {currentStepIndex + 1} / {totalSteps}
          </div>
        </div>

        {/* Continue button */}
        <Button 
          onClick={onContinue} 
          disabled={!continueEnabled}
          className={`shadow-sm ${
            isLastStep 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
          } text-white shadow-lg transition-all`}
        >
          {isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Hoàn thành
            </>
          ) : (
            <>
              Tiếp tục
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SessionNavigation
