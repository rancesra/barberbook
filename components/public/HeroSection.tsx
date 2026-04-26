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
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-bg-primary">

      {/* ── Fondo animado CSS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">

        {/* Degradado de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E0E0E] via-[#111008] to-[#0a0a0a]" />

        {/* Brillo dorado sutil arriba */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gold/8 blur-[100px] rounded-full" />

        {/* Partículas flotantes */}
        <div className="absolute bottom-[20%] left-[15%]  w-1   h-1   rounded-full bg-gold/60 animate-particle-1" />
        <div className="absolute bottom-[35%] left-[40%]  w-1.5 h-1.5 rounded-full bg-gold/50 animate-particle-2" />
        <div className="absolute bottom-[10%] right-[20%] w-1   h-1   rounded-full bg-gold/60 animate-particle-3" />
        <div className="absolute bottom-[50%] right-[35%] w-0.5 h-0.5 rounded-full bg-gold/70 animate-particle-1" />
        <div className="absolute bottom-[60%] left-[60%]  w-1   h-1   rounded-full bg-gold/40 animate-particle-2" />
        <div className="absolute bottom-[30%] left-[75%]  w-1.5 h-1.5 rounded-full bg-gold/50 animate-particle-3" />
        <div className="absolute bottom-[70%] left-[25%]  w-1   h-1   rounded-full bg-gold/40 animate-particle-2" />
        <div className="absolute bottom-[15%] left-[55%]  w-0.5 h-0.5 rounded-full bg-gold/60 animate-particle-1" />

        {/* Grid de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Degradado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-20 text-center w-full">

        {/* Logo texto */}
        <div className="flex justify-center mb-8">
          <span
            className="text-7xl sm:text-8xl tracking-[0.3em] text-white drop-shadow-lg select-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
          >
            ARTIST
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-4">
          Tu estilo,{' '}
          <span className="text-gold">tu arte</span>
        </h1>

        <p className="text-text-secondary text-base mb-10 max-w-xs mx-auto">
          Reserva con tu barbero favorito en segundos
        </p>

        {/* CTA */}
        <Link
          href="/agendar"
          className="inline-flex items-center justify-center bg-gold text-bg-primary font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gold-light transition-all active:scale-95 shadow-xl shadow-gold/40 ring-1 ring-gold/30 w-full sm:w-auto"
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
