'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface PublicHeaderProps {
  barbershop: Barbershop
}

export function PublicHeader({ barbershop }: PublicHeaderProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, me gustaría información sobre ${barbershop.name}`)
    : null

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo + nombre */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={barbershop.logo_url || '/logo.webp'}
            alt={barbershop.name}
            width={44}
            height={44}
            className="rounded-lg object-contain w-11 h-11"
          />
          <span className="font-bold text-text-primary text-sm leading-tight hidden sm:block">
            {barbershop.name}
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-whatsapp text-xs font-medium py-1.5 px-3 rounded-lg border border-whatsapp/30 hover:bg-whatsapp/10 transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          )}

          <Link
            href="/agendar"
            className="text-bg-primary bg-gold text-xs font-bold py-2 px-4 rounded-lg hover:bg-gold-light transition-colors"
          >
            Agendar
          </Link>
        </div>
      </div>
    </header>
  )
}
