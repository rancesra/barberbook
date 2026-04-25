'use client'
import { Check } from 'lucide-react'
import { cn, formatDuration, formatPrice } from '@/lib/utils'
import type { Service } from '@/types'

interface ServiceSelectorProps {
  services: Service[]
  selectedServiceId: string | null
  onSelect: (serviceId: string) => void
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-xl font-bold text-text-primary mb-1">Elige un servicio</h2>
      <p className="text-text-secondary text-sm mb-5">¿Qué te vamos a hacer hoy?</p>

      <div className="grid grid-cols-1 gap-3">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={cn(
                'w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98]',
                isSelected
                  ? 'border-gold bg-gold/5'
                  : 'border-border bg-bg-secondary hover:border-border-light'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary">{service.name}</p>
                    {isSelected && (
                      <div className="w-4 h-4 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-bg-primary" />
                      </div>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <span>⏱</span>
                      {formatDuration(service.duration_minutes)}
                    </span>
                    {service.price !== null && (
                      <span className="text-xs font-semibold text-gold">
                        {formatPrice(service.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
