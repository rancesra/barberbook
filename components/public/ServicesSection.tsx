import Link from 'next/link'
import { Clock } from 'lucide-react'
import { formatDuration, formatPrice } from '@/lib/utils'
import type { Service, Barbershop } from '@/types'

interface ServicesSectionProps {
  services: Service[]
  barbershop: Barbershop
}

export function ServicesSection({ services, barbershop }: ServicesSectionProps) {
  return (
    <section className="px-4 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Servicios</h2>
          <p className="text-text-secondary text-sm mt-1">Lo que hacemos mejor</p>
        </div>
        <Link
          href={`/barberia/${barbershop.slug}/agendar`}
          className="text-gold text-sm font-medium hover:text-gold-light transition-colors"
        >
          Reservar →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((service) => (
          <div key={service.id} className="card p-4 hover:border-border-light transition-colors">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-text-primary">{service.name}</p>
              {service.price !== null && (
                <span className="text-gold font-bold flex-shrink-0">{formatPrice(service.price)}</span>
              )}
            </div>
            {service.description && (
              <p className="text-text-secondary text-sm mt-1.5 line-clamp-2">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-3">
              <Clock size={12} className="text-text-muted" />
              <span className="text-xs text-text-muted">{formatDuration(service.duration_minutes)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
