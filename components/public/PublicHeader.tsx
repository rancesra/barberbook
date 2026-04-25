'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Scissors } from 'lucide-react'
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
        <Link href={`/barberia/${barbershop.slug}`} className="flex items-center gap-2.5">
          {barbershop.logo_url ? (
            <Image
              src={barbershop.logo_url}
              alt={barbershop.name}
              width={32}
              height={32}
              className="rounded-lg object-cover w-8 h-8"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Scissors size={16} className="text-gold" />
            </div>
          )}
          <span className="font-bold text-text-primary text-sm leading-tight">
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
              className="flex items-center gap-1.5 text-whatsapp text-xs font-medium py-1.5 px-3 rounded-lg border border-whatsapp/30 hover:bg-whatsapp/10 transition-colors"
            >
              <MessageCircle size={14} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          <Link
            href={`/barberia/${barbershop.slug}/agendar`}
            className="text-bg-primary bg-gold text-xs font-bold py-2 px-4 rounded-lg hover:bg-gold-light transition-colors"
          >
            Agendar
          </Link>
        </div>
      </div>
    </header>
  )
}
