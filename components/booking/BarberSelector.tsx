'use client'
import Image from 'next/image'
import { Check, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Barber, DayAvailability } from '@/types'

interface BarberSelectorProps {
  barbers: Barber[]
  selectedBarberId: string | null
  availability: Record<string, DayAvailability[]> // barberId -> days
  onSelect: (barberId: string) => void
}

export function BarberSelector({
  barbers,
  selectedBarberId,
  availability,
  onSelect,
}: BarberSelectorProps) {
  return (
    <div className="animate-slide-up">
      <div className="flex flex-col gap-3">
        {barbers.map((barber) => {
          const days = availability[barber.id] || []
          const todayDay = days[0]
          const nextAvailable = days.find((d) => d.available)
          const isSelected = selectedBarberId === barber.id

          let availabilityLabel = ''
          let availabilityClass = ''

          if (todayDay?.available) {
            if (todayDay.slotsCount <= 2) {
              availabilityLabel = `⚡ Últimos ${todayDay.slotsCount} cupos hoy`
              availabilityClass = 'text-yellow-400'
            } else {
              availabilityLabel = `✓ ${todayDay.slotsCount} cupos disponibles hoy`
              availabilityClass = 'text-green-400'
            }
          } else if (nextAvailable) {
            availabilityLabel = `Próxima: ${nextAvailable.label} ${nextAvailable.slots[0]?.label || ''}`
            availabilityClass = 'text-text-secondary'
          } else {
            availabilityLabel = 'Sin disponibilidad esta semana'
            availabilityClass = 'text-text-muted'
          }

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber.id)}
              className={cn(
                'w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98]',
                isSelected
                  ? 'border-gold bg-gold/5'
                  : 'border-border bg-bg-secondary hover:border-border-light'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {barber.photo_url ? (
                    <Image
                      src={barber.photo_url}
                      alt={barber.name}
                      width={64}
                      height={64}
                      className="rounded-xl object-cover w-16 h-16"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-bg-tertiary flex items-center justify-center">
                      <Scissors size={24} className="text-gold" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                      <Check size={12} className="text-bg-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-text-primary">{barber.name}</p>
                      <p className="text-sm text-gold mt-0.5">{barber.specialty}</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className={cn(
                        'flex-shrink-0 mt-1 transition-colors',
                        isSelected ? 'text-gold' : 'text-text-muted'
                      )}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                    {barber.description}
                  </p>
                  <p className={cn('text-xs mt-2 font-medium', availabilityClass)}>
                    {availabilityLabel}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
