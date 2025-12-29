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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-5">
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-5">
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
                    relative w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${isCompleted ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25' : ''}
                    ${isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110' : ''}
                    ${isUpcoming ? 'bg-slate-100 text-slate-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`
                    text-xs mt-2.5 text-center font-medium max-w-16 leading-tight
                    ${isActive ? 'text-blue-600' : ''}
                    ${isCompleted ? 'text-emerald-600' : ''}
                    ${isUpcoming ? 'text-slate-400' : ''}
                  `}
                >
                  {stepLabels[step]}
                </div>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full bg-slate-100 relative overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 ${
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
      <div className="relative">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-slate-400">Bắt đầu</span>
          <span className="text-xs font-medium text-slate-600">{progressPercentage}% hoàn thành</span>
          <span className="text-xs text-slate-400">Kết thúc</span>
        </div>
      </div>
    </div>
  )
}

export default SessionStepper
