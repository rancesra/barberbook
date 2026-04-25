import { Scissors, MessageCircle, Instagram } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import type { Barbershop } from '@/types'

interface PublicFooterProps {
  barbershop: Barbershop
}

export function PublicFooter({ barbershop }: PublicFooterProps) {
  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, quiero información sobre ${barbershop.name}`)
    : null

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Top */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Scissors size={16} className="text-gold" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-sm">{barbershop.name}</p>
              {barbershop.address && (
                <p className="text-text-muted text-xs">{barbershop.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-whatsapp text-sm font-medium hover:text-green-400 transition-colors"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}
            {barbershop.instagram && (
              <a
                href={`https://instagram.com/${barbershop.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-text-secondary text-sm hover:text-text-primary transition-colors"
              >
                <Instagram size={16} />
                Instagram
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
          <span>Lun – Sáb: 8:30 am – 7:30 pm</span>
          <span>·</span>
          <span>Domingo: Cerrado</span>
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-muted text-xs">
            © {currentYear} {barbershop.name}. Todos los derechos reservados.
          </p>
          <p className="text-text-muted text-xs">
            Powered by{' '}
            <span className="text-gold font-medium">BarberBook</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
