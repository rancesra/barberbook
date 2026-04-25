import { MapPin, Clock, MessageCircle, Navigation } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface LocationSectionProps {
  barbershop: Barbershop
}

export function LocationSection({ barbershop }: LocationSectionProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, necesito información sobre ${barbershop.name}`)
    : null

  return (
    <section className="px-4 py-10 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Encuéntranos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Información */}
        <div className="card p-5 space-y-4">
          {barbershop.address && (
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-text-muted mb-0.5">Dirección</p>
                <p className="text-text-primary text-sm">{barbershop.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Clock size={18} className="text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-muted mb-0.5">Horario</p>
              <p className="text-text-primary text-sm">Lun – Sáb: 8:30 am – 7:30 pm</p>
              <p className="text-text-muted text-sm">Domingo: Cerrado</p>
            </div>
          </div>

          {barbershop.whatsapp && (
            <div className="flex items-start gap-3">
              <MessageCircle size={18} className="text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-text-muted mb-0.5">WhatsApp</p>
                <p className="text-text-primary text-sm">{barbershop.whatsapp}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          {barbershop.google_maps_url && (
            <a
              href={barbershop.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              Ver en Google Maps
            </a>
          )}

          {barbershop.google_maps_url && (
            <a
              href={barbershop.google_maps_url2}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Navigation size={18} />
              Cómo llegar
            </a>
          )}

          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={18} />
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
