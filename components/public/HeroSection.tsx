'use client'
import Link from 'next/link'
import { MapPin, Clock, MessageCircle, Crown, ArrowRight, Star } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface HeroSectionProps {
  barbershop: Barbershop
}

const MARQUEE_ITEMS = [
  'Fade',
  'Barba',
  'Diseño',
  'Clásico',
  'Cejas',
  'Ritual premium',
  'Corte + Barba',
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
        <div className="absolute inset-0 bg-bg-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/30 to-bg-primary" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(14,14,14,0.85) 100%)',
          }}
        />

        {/* Glow dorado superior */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[320px] bg-gold/10 blur-[120px] rounded-full animate-glow-pulse" />

        {/* Malla técnica de puntos */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(120% 80% at 50% 30%, #000 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(120% 80% at 50% 30%, #000 30%, transparent 75%)',
          }}
        />

        {/* Línea de escaneo */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent animate-scanline" />

        {/* Partículas mínimas */}
        <div className="absolute bottom-[22%] left-[18%] w-1 h-1 rounded-full bg-gold/50 animate-particle-1" />
        <div className="absolute bottom-[40%] right-[22%] w-1 h-1 rounded-full bg-gold/40 animate-particle-3" />
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-xl mx-auto px-6 pt-16 pb-10 text-center">
          {/* Eyebrow */}
          <div className="animate-rise flex justify-center" style={{ animationDelay: '40ms' }}>
            <span className="eyebrow glass gold-ring rounded-full px-4 py-2 text-gold">
              <Star size={12} className="fill-gold text-gold" />
              Barbería premium
            </span>
          </div>

          {/* Wordmark */}
          <div
            className="animate-rise mt-8 flex flex-col items-center"
            style={{ animationDelay: '120ms' }}
          >
            <span className="font-display font-medium text-white text-6xl sm:text-8xl leading-[0.9] tracking-[0.12em] translate-x-[0.06em]">
              ARTIST
            </span>
            <span className="font-display font-semibold text-gradient-gold text-3xl sm:text-5xl leading-none tracking-[0.42em] translate-x-[0.21em] mt-3">
              STUDIO
            </span>
          </div>

          {/* Subtítulo */}
          <p
            className="animate-rise text-text-secondary text-base sm:text-lg mt-6 max-w-sm mx-auto text-balance"
            style={{ animationDelay: '200ms' }}
          >
            Agenda tu cita con Andrés en segundos. Sin llamadas, sin esperas.
          </p>

          {/* Panel CTA de vidrio */}
          <div
            className="animate-rise glass-strong gold-ring rounded-3xl p-5 sm:p-6 mt-9 text-left"
            style={{ animationDelay: '280ms' }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/agendar"
                className="group flex-1 inline-flex items-center justify-center gap-2 bg-gold text-bg-primary font-bold text-base py-4 px-6 rounded-2xl hover:bg-gold-light transition-all active:scale-[0.98] shadow-[0_8px_30px_-8px_rgba(201,168,76,0.6)]"
              >
                Agendar ahora
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-text-primary font-semibold text-sm py-4 px-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-whatsapp/40 hover:text-whatsapp transition-all active:scale-[0.98]"
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
                  <span className="w-8 h-8 rounded-lg bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-gold" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Ubicación</p>
                    <p className="text-text-secondary text-sm truncate">{barbershop.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-gold" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Horario</p>
                  <p className="text-text-secondary text-sm">Lun–Sáb · 8:30–20:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ver planes */}
          <div className="animate-rise mt-5" style={{ animationDelay: '360ms' }}>
            <button
              onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-text-secondary text-sm font-medium hover:text-gold transition-colors group"
            >
              <Crown size={14} className="text-gold" />
              Ver planes de suscripción
              <ArrowRight size={13} className="rotate-90 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Cinta marquee ── */}
      <div className="relative z-10 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center text-text-muted text-sm font-display tracking-wide">
              <span className="px-6">{item}</span>
              <span className="text-gold/60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
