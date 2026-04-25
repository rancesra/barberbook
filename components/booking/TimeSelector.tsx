'use client'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/types'

interface TimeSelectorProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
  serviceName?: string
}

export function TimeSelector({ slots, selectedSlot, onSelect, serviceName }: TimeSelectorProps) {
  const availableSlots = slots.filter((s) => s.available)

  if (availableSlots.length === 0) {
    return (
      <div className="animate-slide-up">
        <h2 className="text-xl font-bold text-text-primary mb-1">Horarios disponibles</h2>
        <div className="mt-6 text-center py-10">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-text-secondary font-medium">No hay horarios disponibles</p>
          <p className="text-text-muted text-sm mt-1">Prueba con otro día</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <h2 className="text-xl font-bold text-text-primary mb-1">Horarios disponibles</h2>
      {serviceName && (
        <p className="text-text-secondary text-sm mb-5">
          {availableSlots.length} horario{availableSlots.length !== 1 ? 's' : ''} para {serviceName}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        {availableSlots.map((slot) => {
          const isSelected =
            selectedSlot?.startTime === slot.startTime

          return (
            <button
              key={slot.startTime}
              onClick={() => onSelect(slot)}
              className={cn(
                'py-3.5 px-2 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95',
                isSelected
                  ? 'border-gold bg-gold text-bg-primary'
                  : 'border-border bg-bg-secondary text-text-primary hover:border-gold/50 hover:text-gold'
              )}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
