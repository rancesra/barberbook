'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Instagram, MapPin, ArrowRight } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface PublicHeaderProps {
  barbershop: Barbershop
}

export function PublicHeader({ barbershop }: PublicHeaderProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, me gustaría información sobre ${barbershop.name}`)
    : null

  const mapsUrl = barbershop.google_maps_url ?? null
  const instagramUrl = barbershop.instagram
    ? `https://instagram.com/${barbershop.instagram.replace('@', '')}`
    : null

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative">
            <Image
              src={barbershop.logo_url || '/logo.webp'}
              alt={barbershop.name}
              width={40}
              height={40}
              className="rounded-lg object-contain w-10 h-10 ring-1 ring-white/10"
            />
          </span>
          <span className="font-display font-semibold text-text-primary text-sm tracking-wide leading-tight hidden sm:block">
            {barbershop.name}
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          {/* Maps */}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary transition-colors p-2 rounded-lg hover:text-gold hover:bg-white/5 sm:text-xs sm:font-medium sm:py-2 sm:px-3"
              title="Cómo llegar"
            >
              <MapPin size={15} />
              <span className="text-xs font-medium hidden sm:inline">Cómo llegar</span>
            </a>
          )}

          {/* Instagram */}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-secondary transition-colors p-2 rounded-lg hover:text-pink-400 hover:bg-white/5 sm:text-xs sm:font-medium sm:py-2 sm:px-3"
              title="Instagram"
            >
              <Instagram size={15} />
              <span className="text-xs font-medium hidden sm:inline">Instagram</span>
            </a>
          )}

          {/* WhatsApp — móvil solo ícono */}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden p-2 rounded-lg text-whatsapp hover:bg-whatsapp/10 transition-colors"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          )}

          {/* Agendar */}
          <Link
            href="/agendar"
            className="group inline-flex items-center gap-1.5 text-bg-primary bg-gold text-xs font-bold py-2 px-4 rounded-lg hover:bg-gold-light transition-all active:scale-95 shadow-[0_4px_16px_-6px_rgba(201,168,76,0.6)]"
          >
            Agendar
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  )
}
