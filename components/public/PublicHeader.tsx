'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Scissors, LogIn, LogOut, Crown, User } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import type { Barbershop } from '@/types'

interface PublicHeaderProps {
  barbershop: Barbershop
}

export function PublicHeader({ barbershop }: PublicHeaderProps) {
  const { user, loading } = useUser()

  const waLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, `Hola, me gustaría información sobre ${barbershop.name}`)
    : null

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        redirectTo: `${window.location.origin}/barberia/${barbershop.slug}`,
      },
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  const userName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0]
  const userAvatar = user?.user_metadata?.avatar_url

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
          <span className="font-bold text-text-primary text-sm leading-tight hidden sm:block">
            {barbershop.name}
          </span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* WhatsApp */}
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

          {/* Google login / usuario */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Mi suscripción */}
                  <Link
                    href={`/barberia/${barbershop.slug}/mi-suscripcion`}
                    className="hidden sm:flex items-center gap-1.5 text-gold text-xs font-medium py-1.5 px-3 rounded-lg border border-gold/30 hover:bg-gold/10 transition-colors"
                  >
                    <Crown size={13} />
                    Mi plan
                  </Link>

                  {/* Avatar + nombre */}
                  <div className="flex items-center gap-1.5">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName || ''}
                        width={28}
                        height={28}
                        className="rounded-full w-7 h-7"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center">
                        <User size={14} className="text-text-secondary" />
                      </div>
                    )}
                    <span className="text-text-secondary text-xs hidden sm:block">{userName}</span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-secondary transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-1.5 text-text-secondary text-xs font-medium py-1.5 px-3 rounded-lg border border-border hover:border-border-light hover:text-text-primary transition-colors"
                >
                  <LogIn size={13} />
                  <span className="hidden sm:inline">Google Calendar</span>
                  <span className="sm:hidden">Sincronizar</span>
                </button>
              )}
            </>
          )}

          {/* Agendar */}
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
