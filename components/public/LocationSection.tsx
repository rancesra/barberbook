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
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow text-gold">
          <MapPin size={12} />
          Visítanos
        </span>
        <h2 className="font-display font-semibold text-3xl text-text-primary mt-3">Encuéntranos</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Información */}
        <div className="glass-strong rounded-3xl p-6 space-y-5">
          {barbershop.address && (
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <MapPin size={17} className="text-gold" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-1">Dirección</p>
                <p className="text-text-primary text-sm">{barbershop.address}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Clock size={17} className="text-gold" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-1">Horario</p>
              <p className="text-text-primary text-sm">Lun – Sáb: 8:30 am – 7:30 pm</p>
              <p className="text-text-muted text-sm">Domingo: Cerrado</p>
            </div>
          </div>

          {barbershop.whatsapp && (
            <div className="flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={17} className="text-gold" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted mb-1">WhatsApp</p>
                <p className="text-text-primary text-sm">{barbershop.whatsapp}</p>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 justify-center">
          {barbershop.google_maps_url && (
            <a
              href={barbershop.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 py-4 px-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold/40 transition-all active:scale-[0.98]"
            >
              <span className="flex items-center gap-3 text-text-primary font-medium text-sm">
                <MapPin size={18} className="text-gold" />
                Ver en Google Maps
              </span>
              <Navigation size={15} className="text-text-muted group-hover:text-gold transition-colors" />
            </a>
          )}

          {barbershop.google_maps_url2 && (
            <a
              href={barbershop.google_maps_url2}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 py-4 px-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold/40 transition-all active:scale-[0.98]"
            >
              <span className="flex items-center gap-3 text-text-primary font-medium text-sm">
                <Navigation size={18} className="text-gold" />
                Cómo llegar
              </span>
              <Navigation size={15} className="text-text-muted group-hover:text-gold transition-colors" />
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
