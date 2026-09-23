'use client'
import { MapPin, Clock, MessageCircle, Crown, ChevronDown, KeyRound, ArrowRight, Info } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import { SheetLink } from '@/components/ui/SheetLink'
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
        {/* Como <img> y no como fondo CSS: el navegador la encuentra al leer el
            HTML y la empieza a bajar de una, en vez de esperar a que el CSS se
            descargue. Es lo que quitaba el "negro y luego la foto". */}
        <picture>
          <source media="(min-width: 640px)" srcSet="/fondo.webp" />
          <img
            src="/fondo2.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </picture>

        {/* Degradado de fondo — solo lo necesario para que el texto se lea */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/45 via-transparent to-bg-primary/80" />

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
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-16 sm:py-20 text-center w-full">

        {/* Logo texto */}
        <div className="flex flex-col items-center mb-7 sm:mb-10">
          <span
            className="font-display font-light translate-x-[0.15em] text-6xl sm:text-8xl tracking-[0.3em] text-white drop-shadow-lg select-none leading-none"
          >
            ARTIST
          </span>
          <div className="my-2" />
          <span
            className="font-display font-light translate-x-[0.15em] text-4xl sm:text-5xl tracking-[0.5em] text-white/80 drop-shadow-lg select-none leading-none"
          >
            STUDIO
          </span>
        </div>

        <p className="text-text-secondary text-sm sm:text-base mb-7 sm:mb-10 max-w-xs mx-auto">
          Agenda tu cita con Andrés en segundos
        </p>

        {/* Aviso informativo — se activa desde el panel admin */}
        {barbershop.announcement_active && barbershop.announcement_text && (
          <div className="glass-strong mb-7 sm:mb-10 mx-auto max-w-md rounded-3xl px-5 py-4 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Info size={13} className="text-gold flex-shrink-0" />
              <span className="text-[10px] font-bold tracking-[0.12em] text-gold">AVISO</span>
            </div>
            <p className="text-white text-base sm:text-lg font-semibold leading-snug whitespace-pre-line">
              {barbershop.announcement_text}
            </p>
          </div>
        )}

        {/* CTA */}
        <SheetLink
          href="/agendar"
          className="glass-gold inline-flex items-center justify-center gap-2 text-bg-primary font-bold text-sm sm:text-lg py-3.5 sm:py-4 px-9 sm:px-11 rounded-full hover:brightness-110 transition-all active:scale-95"
        >
          Agendar ahora
          <ArrowRight size={17} strokeWidth={2.4} />
        </SheetLink>

        {/* Info secundaria */}
        <div className="glass mt-6 sm:mt-8 mx-auto max-w-xs rounded-3xl px-5 py-3.5 flex flex-col gap-2 text-xs sm:text-sm text-white/80">
          {barbershop.address && (
            <div className="flex items-center gap-2.5">
              <MapPin size={13} className="text-gold flex-shrink-0" />
              <span className="text-left">{barbershop.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Clock size={13} className="text-gold flex-shrink-0" />
            <span>Lun – Sáb · 8:30 am – 8:30 pm</span>
          </div>
        </div>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full text-whatsapp text-sm font-semibold hover:bg-white/10 transition-all active:scale-95"
          >
            <MessageCircle size={15} />
            Contactar por WhatsApp
          </a>
        )}

        {/* Accesos secundarios */}
        <div className="flex items-center justify-center gap-2.5 mt-3 flex-wrap">
          <button
            onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-gold text-sm font-semibold hover:bg-white/10 transition-all active:scale-95 group"
          >
            <Crown size={14} />
            Planes
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => document.getElementById('cancelar')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white/85 text-sm font-semibold hover:bg-white/10 transition-all active:scale-95 group"
          >
            <KeyRound size={14} />
            Cancelar cita
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </section>
  )
}
