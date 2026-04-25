'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Crown, Calendar, Scissors, AlertCircle, LogIn } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  cuts_used: number
  cuts_total: number
  starts_at: string
  expires_at: string
  notes: string | null
  plan: {
    name: string
    subtitle: string
    price: number
    color: string
    benefits: string[]
  }
}

export default function MiSuscripcionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, loading } = useUser()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSub, setLoadingSub] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) return

    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('*, plan:plans(name, subtitle, price, color, benefits)')
      .eq('customer_email', user.email)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setSubscription(data)
        setLoadingSub(false)
      })
  }, [user, loading])

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        redirectTo: `${window.location.origin}/barberia/${slug}/mi-suscripcion`,
      },
    })
  }

  if (loading || loadingSub) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted text-sm">Cargando...</div>
      </div>
    )
  }

  // No logueado
  if (!user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Crown size={28} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Ver mi suscripción</h1>
          <p className="text-text-secondary text-sm mb-6">
            Inicia sesión con Google para ver tu plan activo, cortes disponibles y fecha de vencimiento.
          </p>
          <Button onClick={handleGoogleLogin} fullWidth>
            <LogIn size={16} className="mr-2" />
            Continuar con Google
          </Button>
          <Link
            href={`/barberia/${slug}`}
            className="block mt-4 text-text-muted text-sm hover:text-text-secondary transition-colors"
          >
            ← Volver a la barbería
          </Link>
        </div>
      </div>
    )
  }

  // Sin suscripción activa
  if (!subscription) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-text-muted" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Sin plan activo</h1>
          <p className="text-text-secondary text-sm mb-6">
            No tienes una suscripción activa. ¡Adquiere un plan y empieza a ahorrar!
          </p>
          <Link href={`/barberia/${slug}#planes`}>
            <Button fullWidth>
              <Crown size={16} className="mr-2" />
              Ver planes disponibles
            </Button>
          </Link>
          <Link
            href={`/barberia/${slug}`}
            className="block mt-4 text-text-muted text-sm hover:text-text-secondary transition-colors"
          >
            ← Volver a la barbería
          </Link>
        </div>
      </div>
    )
  }

  const daysLeft = differenceInDays(parseISO(subscription.expires_at), new Date())
  const cutsLeft = subscription.cuts_total - subscription.cuts_used
  const cutsPercent = Math.round((subscription.cuts_used / subscription.cuts_total) * 100)
  const isUnlimited = subscription.cuts_total >= 99

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href={`/barberia/${slug}`}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors mb-6 block"
        >
          ← Volver
        </Link>

        <h1 className="text-2xl font-bold text-text-primary mb-6">Mi suscripción</h1>

        {/* Plan card */}
        <div
          className="rounded-2xl p-6 mb-4 border"
          style={{
            backgroundColor: `${subscription.plan.color}15`,
            borderColor: `${subscription.plan.color}40`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: subscription.plan.color }}>
                Plan activo
              </p>
              <h2 className="text-2xl font-bold text-text-primary">{subscription.plan.name}</h2>
              <p className="text-text-secondary text-sm">{subscription.plan.subtitle}</p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${subscription.plan.color}25` }}
            >
              <Crown size={22} style={{ color: subscription.plan.color }} />
            </div>
          </div>

          {/* Vencimiento */}
          <div className="bg-bg-primary/40 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-muted" />
                <span className="text-text-muted text-xs">Vence el</span>
              </div>
              <span
                className={`text-xs font-bold ${daysLeft <= 5 ? 'text-red-400' : daysLeft <= 10 ? 'text-yellow-400' : 'text-green-400'}`}
              >
                {daysLeft <= 0 ? 'Vencido' : `${daysLeft} días restantes`}
              </span>
            </div>
            <p className="text-text-primary font-medium mt-1 text-sm">
              {format(parseISO(subscription.expires_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>

          {/* Cortes */}
          {!isUnlimited && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Scissors size={14} className="text-text-muted" />
                  <span className="text-text-muted text-xs">Cortes este mes</span>
                </div>
                <span className="text-text-primary text-xs font-bold">
                  {subscription.cuts_used} / {subscription.cuts_total} usados
                </span>
              </div>
              <div className="w-full bg-bg-primary/40 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${cutsPercent}%`,
                    backgroundColor: subscription.plan.color,
                  }}
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: subscription.plan.color }}>
                {cutsLeft > 0 ? `Te quedan ${cutsLeft} corte${cutsLeft !== 1 ? 's' : ''}` : 'Cortes agotados este mes'}
              </p>
            </div>
          )}

          {isUnlimited && (
            <div className="flex items-center gap-2">
              <Scissors size={14} style={{ color: subscription.plan.color }} />
              <span className="text-sm font-medium" style={{ color: subscription.plan.color }}>
                Cortes ilimitados incluidos ✓
              </span>
            </div>
          )}
        </div>

        {/* Nota del admin */}
        {subscription.notes && (
          <div className="card p-4 mb-4">
            <p className="text-xs text-text-muted mb-1">Nota de la barbería</p>
            <p className="text-text-secondary text-sm">{subscription.notes}</p>
          </div>
        )}

        {/* Agendar cita */}
        <Link href={`/barberia/${slug}/agendar`}>
          <Button fullWidth>
            <Scissors size={16} className="mr-2" />
            Agendar mi próxima cita
          </Button>
        </Link>

        {/* Renovar */}
        {daysLeft <= 7 && (
          <div className="mt-4 p-4 rounded-xl border border-yellow-800/30 bg-yellow-900/10">
            <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Tu plan vence pronto</p>
            <p className="text-text-secondary text-xs">
              Contáctanos para renovar y no perder tu descuento.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
