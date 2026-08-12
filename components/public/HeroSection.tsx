'use client'
import Link from 'next/link'
import { MapPin, Clock, MessageCircle, Crown, ArrowRight, Scissors } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface HeroSectionProps {
  barbershop: Barbershop
}

const MARQUEE_ITEMS = [
  'FADE',
  'BARBA',
  'DISEÑO',
  'CLÁSICO',
  'CEJAS',
  'RITUAL PREMIUM',
  'CORTE + BARBA',
]

export function HeroSection({ barbershop }: HeroSectionProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, quiero reservar en ${barbershop.name}`)
    : null

  return (
    <section className="relative overflow-hidden min-h-[100svh] flex flex-col bg-bg-primary">
      {/* ── Fondo ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/fondo2.webp')] bg-cover bg-center sm:bg-[url('/fondo.webp')]" />

        {/* Oscurecido + viñeta */}
        <div className="absolute inset-0 bg-bg-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-bg-primary/40 to-bg-primary" />

        {/* Rejilla blueprint */}
        <div
          className="absolute inset-0 tech-grid opacity-70"
          style={{
            maskImage: 'radial-gradient(120% 80% at 50% 20%, #000 25%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(120% 80% at 50% 20%, #000 25%, transparent 80%)',
          }}
        />

        {/* Glow dorado superior */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[320px] bg-gold/10 blur-[120px] rounded-full animate-glow-pulse" />

        {/* Línea de escaneo */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent animate-scanline" />

        {/* Líneas guía verticales */}
        <div className="absolute top-0 bottom-0 left-8 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden sm:block" />
        <div className="absolute top-0 bottom-0 right-8 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden sm:block" />
      </div>

      {/* ── Barra de estado tipo consola ── */}
      <div className="relative z-10 border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between font-mono-tech text-[10px] tracking-[0.16em] text-text-muted">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-blink" />
            <span className="text-green-400">ONLINE</span>
            <span className="hidden sm:inline text-text-muted/60">// AGENDA ABIERTA</span>
          </span>
          <span className="hidden sm:inline text-text-muted/70">SYS.BARBER v2.0</span>
          <span className="text-gold/80">LUN–SÁB 08:30—20:30</span>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-xl mx-auto px-6 pt-14 pb-10 text-center">
          {/* Eyebrow */}
          <div className="animate-rise flex justify-center" style={{ animationDelay: '40ms' }}>
            <span className="tech-tag glass rounded-sm px-3 py-1.5 flex items-center gap-2 text-gold">
              <Scissors size={11} className="text-gold" />
              [ BARBERÍA PREMIUM ]
            </span>
          </div>

          {/* Wordmark */}
          <div
            className="animate-rise mt-8 flex flex-col items-center"
            style={{ animationDelay: '120ms' }}
          >
            <span className="font-display font-medium text-white text-6xl sm:text-8xl leading-[0.9] tracking-[0.1em] translate-x-[0.05em]">
              ARTIST
            </span>
            <span className="font-display font-semibold text-gradient-gold text-3xl sm:text-5xl leading-none tracking-[0.42em] translate-x-[0.21em] mt-3">
              STUDIO
            </span>
            {/* Regleta técnica bajo el wordmark */}
            <div className="mt-5 flex items-center gap-3 font-mono-tech text-[10px] tracking-[0.2em] text-text-muted">
              <span className="h-px w-8 bg-gold/40" />
              <span>EST. 2019</span>
              <span className="text-gold/60">/</span>
              <span>{barbershop.address ? 'GUARNE · ANT' : 'COLOMBIA'}</span>
              <span className="h-px w-8 bg-gold/40" />
            </div>
          </div>

          {/* Subtítulo */}
          <p
            className="animate-rise text-text-secondary text-base sm:text-lg mt-6 max-w-sm mx-auto text-balance"
            style={{ animationDelay: '200ms' }}
          >
            Agenda tu cita con Andrés en segundos. Sin llamadas, sin esperas.
          </p>

          {/* Panel CTA técnico */}
          <div
            className="animate-rise glass-strong hud-corners rounded-none p-5 sm:p-6 mt-9 text-left"
            style={{ animationDelay: '280ms' }}
          >
            {/* Encabezado del panel */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 font-mono-tech text-[10px] tracking-[0.18em] text-text-muted">
              <span className="text-gold/80">&gt; RESERVA_RÁPIDA</span>
              <span className="animate-blink text-gold">_</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/agendar"
                className="group flex-1 inline-flex items-center justify-center gap-2 bg-gold text-bg-primary font-bold text-base py-4 px-6 rounded-none hover:bg-gold-light transition-all active:scale-[0.98] shadow-[0_8px_30px_-8px_rgba(201,168,76,0.6)]"
              >
                AGENDAR AHORA
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-text-primary font-semibold text-sm py-4 px-5 rounded-none border border-white/10 bg-white/[0.03] hover:border-whatsapp/40 hover:text-whatsapp transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
              )}
            </div>

            {/* Info técnica */}
            <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {barbershop.address && (
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-none border border-gold/25 bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-gold" />
                  </span>
                  <div className="min-w-0">
                    <p className="tech-tag">UBICACIÓN</p>
                    <p className="text-text-secondary text-sm truncate">{barbershop.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-none border border-gold/25 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-gold" />
                </span>
                <div className="min-w-0">
                  <p className="tech-tag">HORARIO</p>
                  <p className="text-text-secondary text-sm">Lun–Sáb · 8:30–20:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ver planes */}
          <div className="animate-rise mt-5" style={{ animationDelay: '360ms' }}>
            <button
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 font-mono-tech text-[11px] tracking-[0.16em] text-text-secondary hover:text-gold transition-colors group"
            >
              <Crown size={14} className="text-gold" />
              VER PLANES DE SUSCRIPCIÓN
              <ArrowRight size={13} className="rotate-90 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Cinta marquee ── */}
      <div className="relative z-10 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center font-mono-tech text-text-muted text-xs tracking-[0.2em]">
              <span className="px-6">{item}</span>
              <span className="text-gold/60">+</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
