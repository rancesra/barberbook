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
    <div className="ios-step">
      <div className="grid grid-cols-1 gap-3 ios-stagger">
        {services.map((service) => {
          const isSelected = selectedServiceId === service.id
          return (
            <button
              key={service.id}
              onClick={(e) => {
                // Nombrar la tarjeta justo antes del cambio: el navegador la
                // empareja con la fila de resumen y la transforma.
                e.currentTarget.style.viewTransitionName = 'servicio-elegido'
                onSelect(service.id)
              }}
              className={cn(
                'w-full text-left p-4 rounded-3xl transition-all duration-200 active:scale-[0.98]',
                isSelected
                  ? 'glass-strong border-gold/50 ring-1 ring-gold/30'
                  : 'glass hover:bg-white/10'
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
