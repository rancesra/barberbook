import Link from 'next/link'
import Image from 'next/image'
import { Scissors } from 'lucide-react'
import type { Barber, DayAvailability } from '@/types'
import { getNextAvailableSlot } from '@/lib/availability'
import { cn } from '@/lib/utils'

interface BarberCardProps {
  barber: Barber
  barbershopSlug: string
  availability: DayAvailability[]
}

export function BarberCard({ barber, barbershopSlug, availability }: BarberCardProps) {
  const todayDay = availability[0]
  const nextAvailable = getNextAvailableSlot(availability)
  const totalToday = todayDay?.slotsCount ?? 0
  const isAvailableToday = todayDay?.available ?? false

  return (
    <div className="card p-4 flex flex-col gap-4">
      {/* Foto + nombre */}
      <div className="flex items-start gap-3">
        {barber.photo_url ? (
          <Image
            src={barber.photo_url}
            alt={barber.name}
            width={72}
            height={72}
            className="rounded-2xl object-cover w-18 h-18 flex-shrink-0"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-2xl bg-bg-tertiary flex items-center justify-center flex-shrink-0">
            <Scissors size={28} className="text-gold" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-text-primary">{barber.name}</p>
          <p className="text-gold text-sm mt-0.5">{barber.specialty}</p>
          {barber.description && (
            <p className="text-text-secondary text-xs mt-1.5 line-clamp-2">
              {barber.description}
            </p>
          )}
        </div>
      </div>

      {/* Disponibilidad */}
      <div className={cn(
        'rounded-xl px-3 py-2.5 text-sm',
        isAvailableToday
          ? totalToday <= 2
            ? 'bg-yellow-900/20 border border-yellow-800/30'
            : 'bg-green-900/20 border border-green-800/30'
          : 'bg-bg-tertiary border border-border'
      )}>
        {isAvailableToday ? (
          <div>
            <p className={cn(
              'font-semibold',
              totalToday <= 2 ? 'text-yellow-400' : 'text-green-400'
            )}>
              {totalToday <= 2
                ? `⚡ Últimos ${totalToday} cupos hoy`
                : `✓ ${totalToday} cupos disponibles hoy`}
            </p>
            {todayDay.slots[0] && (
              <p className="text-text-secondary text-xs mt-0.5">
                Próximo: {todayDay.slots[0].label}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-text-muted font-medium">Agenda llena hoy</p>
            {nextAvailable && (
              <p className="text-text-secondary text-xs mt-0.5">
                Próxima disponibilidad: {nextAvailable}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botón */}
      <Link
        href={`/barberia/${barbershopSlug}/agendar?barbero=${barber.id}`}
        className="btn-primary text-sm py-3"
      >
        Elegir a {barber.name.split(' ')[0]}
      </Link>
    </div>
  )
}
