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
    <div className="bg-white/40 backdrop-blur-md rounded-[2rem] shadow-sm border border-white p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={onBack} 
          disabled={isFirstStep}
          className="rounded-xl text-slate-400 font-bold px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          QUAY LẠI
        </Button>

        {/* Center section */}
        <div className="flex items-center gap-4">
          {/* Skip button */}
          {onSkip && (
            <Button 
              variant="ghost" 
              onClick={onSkip} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 rounded-xl"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1.5" />
              Bỏ qua bài này
            </Button>
          )}
          
          {/* Step indicator */}
          <div className="px-4 py-1.5 rounded-xl bg-white/60 text-[10px] font-black text-violet-500 shadow-sm border border-violet-100 uppercase tracking-widest">
            BƯỚC {currentStepIndex + 1} / {totalSteps}
          </div>
        </div>

        {/* Continue button */}
        <Button 
          onClick={onContinue} 
          disabled={!continueEnabled}
          className={`px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 ${
            isLastStep 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' 
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-200'
          } text-white disabled:opacity-30 disabled:shadow-none`}
        >
          {isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              HOÀN THÀNH
            </>
          ) : (
            <>
              TIẾP TỤC
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SessionNavigation
