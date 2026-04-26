'use client'
import { useRef, useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayAvailability } from '@/types'

interface DateSelectorProps {
  days: DayAvailability[]
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DateSelector({ days, selectedDate, onSelect }: DateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    check()
    el.addEventListener('scroll', check)
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [days])

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 180, behavior: 'smooth' })
  }

  return (
    <div className="animate-slide-up">
      {/* Contenedor con flecha derecha */}
      <div className="relative -mx-4">
        <div
          ref={scrollRef}
          className="flex gap-3 px-4 pb-3 overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((day) => {
            const isSelected = selectedDate === day.date
            const isAvailable = day.available
            const isClosed = day.status === 'closed'
            const isFull = day.status === 'full'

            return (
              <button
                key={day.date}
                onClick={() => isAvailable && onSelect(day.date)}
                disabled={!isAvailable}
                className={cn(
                  'flex-shrink-0 w-[78px] flex flex-col items-center py-3.5 px-2 rounded-2xl border transition-all duration-200',
                  isSelected && 'border-gold bg-gold/10',
                  !isSelected && isAvailable && 'border-border bg-bg-secondary hover:border-border-light active:scale-95',
                  !isAvailable && 'border-border bg-bg-secondary/50 opacity-50 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    isSelected ? 'text-gold' : isAvailable ? 'text-text-primary' : 'text-text-muted'
                  )}
                >
                  {day.label}
                </span>

                <div className="mt-2">
                  {isClosed ? (
                    <span className="text-[10px] text-text-muted">Cerrado</span>
                  ) : isFull ? (
                    <span className="text-[10px] text-red-400 font-medium">Lleno</span>
                  ) : day.status === 'few' ? (
                    <>
                      <span className="text-base font-bold text-yellow-400">{day.slotsCount}</span>
                      <span className="text-[10px] text-yellow-400 block text-center leading-tight">cupos</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base font-bold text-green-400">{day.slotsCount}</span>
                      <span className="text-[10px] text-green-400 block text-center leading-tight">cupos</span>
                    </>
                  )}
                </div>

                {isSelected && (
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gold" />
                )}
              </button>
            )
          })}
        </div>

        {/* Flecha "hay más días →" */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-full bg-gradient-to-l from-bg-primary via-bg-primary/80 to-transparent pr-1"
          >
            <div className="w-7 h-7 rounded-full bg-bg-secondary border border-border flex items-center justify-center shadow-lg">
              <ChevronRight size={14} className="text-gold" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
