import Link from 'next/link'
import { MapPin, Clock, MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface HeroSectionProps {
  barbershop: Barbershop
}

export function HeroSection({ barbershop }: HeroSectionProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, quiero reservar en ${barbershop.name}`)
    : null

  return (
    <section className="relative overflow-hidden bg-bg-primary pt-12 pb-16 px-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto text-center">
        {/* Chip */}
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-xs font-medium">Reserva en línea disponible</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">
          Reserva tu cita con tu{' '}
          <span className="text-gold">barbero favorito</span>
        </h1>

        <p className="text-text-secondary text-base mb-8 max-w-sm mx-auto">
          Elige barbero, día y hora disponible en menos de 1 minuto. Sin llamadas, sin esperas.
        </p>

        {/* CTA principal */}
        <Link
          href={`/barberia/${barbershop.slug}/agendar`}
          className="inline-flex items-center justify-center bg-gold text-bg-primary font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gold-light transition-colors active:scale-95 w-full sm:w-auto"
        >
          Agendar ahora
        </Link>

        {/* Info secundaria */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm text-text-muted">
          {barbershop.address && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold flex-shrink-0" />
              <span>{barbershop.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gold flex-shrink-0" />
            <span>Lun – Sáb  8:30 am – 7:30 pm</span>
          </div>
        </div>

        {/* WhatsApp link */}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-whatsapp text-sm font-medium hover:underline"
          >
            <MessageCircle size={16} />
            Contactar por WhatsApp
          </a>
        )}
      </div>
    </section>
  )
}
