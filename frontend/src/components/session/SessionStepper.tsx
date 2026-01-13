// src/components/session/SessionStepper.tsx
import React from 'react'
import { Check, Layers, HelpCircle, Keyboard, PenTool, Trophy } from 'lucide-react'
import type { SessionStep } from '@/types/session'

interface SessionStepperProps {
  steps: SessionStep[]
  stepLabels: Record<SessionStep, string>
  currentStepIndex: number
  progressPercentage: number
}

const STEP_ICONS: Record<SessionStep, React.ElementType> = {
  FLASHCARDS: Layers,
  QUIZ_PART1: HelpCircle,
  QUIZ_PART2: HelpCircle,
  SPELLING: Keyboard,
  FILL_BLANK: PenTool,
  SUMMARY: Trophy,
}

const SessionStepper: React.FC<SessionStepperProps> = ({
  steps,
  stepLabels,
  currentStepIndex,
  progressPercentage
}) => {
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white p-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          const isUpcoming = index > currentStepIndex
          const Icon = STEP_ICONS[step]

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 shadow-sm
                    ${isCompleted ? 'bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-emerald-200' : ''}
                    ${isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-violet-200 scale-125 z-10' : ''}
                    ${isUpcoming ? 'bg-white/60 text-slate-300 border border-white' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <div
                  className={`
                    text-[10px] mt-4 text-center font-black uppercase tracking-tighter max-w-[70px] leading-tight transition-colors
                    ${isActive ? 'text-violet-600' : ''}
                    ${isCompleted ? 'text-emerald-600' : ''}
                    ${isUpcoming ? 'text-slate-400' : ''}
                  `}
                >
                  {stepLabels[step]}
                </div>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 rounded-full bg-slate-100/50 relative overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300 ${
                      index < currentStepIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative px-2">
        <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden border border-white/40">
          <div
            className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(167,139,250,0.3)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">BẮT ĐẦU</span>
          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{progressPercentage}% HOÀN THÀNH</span>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">KẾT THÚC</span>
        </div>
      </div>
    </div>
  )
}

export default SessionStepper
