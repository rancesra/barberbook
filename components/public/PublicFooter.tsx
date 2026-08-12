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
    <footer className="border-t border-white/10 bg-bg-secondary/60">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Top */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center">
              <Scissors size={16} className="text-gold" />
            </div>
            <div>
              <p className="font-display font-semibold text-text-primary text-sm tracking-wide">{barbershop.name}</p>
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
          <span>Lun – Sáb: 8:30 am – 8:30 pm</span>
          <span>·</span>
          <span>Domingo: Cerrado</span>
        </div>

        {/* Bottom */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-muted text-xs">
            © {currentYear} {barbershop.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <a href="/privacidad" className="hover:text-text-secondary transition-colors">Privacidad</a>
            <span>·</span>
            <a href="/terminos" className="hover:text-text-secondary transition-colors">Términos</a>
            <span>·</span>
            <span>Powered by <span className="text-gold font-medium">BarberBook</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
