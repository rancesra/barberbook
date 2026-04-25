'use client'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  label: string
  icon?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full px-1">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  isCompleted && 'bg-gold text-bg-primary',
                  isCurrent && 'bg-gold/20 border-2 border-gold text-gold',
                  !isCompleted && !isCurrent && 'bg-bg-tertiary text-text-muted'
                )}
              >
                {isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 whitespace-nowrap',
                  isCurrent ? 'text-gold font-medium' : 'text-text-muted'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-1 mb-4 transition-colors duration-300',
                  isCompleted ? 'bg-gold' : 'bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
