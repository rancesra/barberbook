'use client'
import { cn } from '@/lib/utils'
import type { DayAvailability } from '@/types'

interface DateSelectorProps {
  days: DayAvailability[]
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DateSelector({ days, selectedDate, onSelect }: DateSelectorProps) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-xl font-bold text-text-primary mb-1">Selecciona un día</h2>
      <p className="text-text-secondary text-sm mb-5">Próximos 7 días disponibles</p>

      {/* Fila horizontal desplazable */}
      <div className="scroll-x-hidden flex gap-3 pb-2 -mx-4 px-4">
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
                'flex-shrink-0 w-[80px] flex flex-col items-center py-3.5 px-2 rounded-2xl border transition-all duration-200',
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

      {selectedDate && (
        <p className="text-xs text-text-muted mt-3 text-center">
          Mostrando horarios disponibles para el día seleccionado
        </p>
      )}
    </div>
  )
}
