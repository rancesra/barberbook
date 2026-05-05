'use client'
import { useEffect, useState } from 'react'
import { Crown, Plus, Check, X, Scissors, MessageCircle } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { buildWhatsAppLink } from '@/lib/utils'

interface Subscription {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  cuts_used: number
  cuts_total: number
  status: string
  starts_at: string
  expires_at: string
  notes: string | null
  plan: { name: string; color: string; price: number }
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  expired: 'Vencido',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-900/30',
  expired: 'text-red-400 bg-red-900/20',
  pending: 'text-yellow-400 bg-yellow-900/20',
  cancelled: 'text-text-muted bg-bg-tertiary',
}

export default function SuscripcionesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(name, color, price)')
      .order('created_at', { ascending: false })
    setSubscriptions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('subscriptions').update({ status }).eq('id', id)
    load()
  }

  const addCut = async (sub: Subscription) => {
    if (sub.cuts_used >= sub.cuts_total && sub.cuts_total < 99) return
    const supabase = createClient()
    await supabase
      .from('subscriptions')
      .update({ cuts_used: sub.cuts_used + 1 })
      .eq('id', sub.id)
    load()
  }

  const selected = subscriptions.find(s => s.id === selectedId)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-bg-secondary rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Suscripciones</h1>
          <p className="text-text-secondary text-sm mt-1">
            {subscriptions.filter(s => s.status === 'active').length} activas · {subscriptions.length} total
          </p>
        </div>
        <a
          href="/admin/suscripciones/nueva"
          className="flex items-center gap-2 bg-gold text-bg-primary text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} />
          Nueva suscripción
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subscriptions.map((sub) => {
          const daysLeft = differenceInDays(parseISO(sub.expires_at), new Date())
          const isUnlimited = sub.cuts_total >= 99
          const cutsLeft = sub.cuts_total - sub.cuts_used

          return (
            <div
              key={sub.id}
              className={`card p-4 cursor-pointer transition-all hover:border-border-light ${selectedId === sub.id ? 'border-gold' : ''}`}
              onClick={() => setSelectedId(selectedId === sub.id ? null : sub.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-text-primary">{sub.customer_name}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[sub.status]}`}
                    >
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">{sub.customer_email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${sub.plan.color}20`, color: sub.plan.color }}
                    >
                      {sub.plan.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      Vence: {format(parseISO(sub.expires_at), "d MMM yyyy", { locale: es })}
                    </span>
                    {daysLeft <= 5 && daysLeft > 0 && (
                      <span className="text-xs text-yellow-400">⚠️ {daysLeft}d</span>
                    )}
                    {daysLeft <= 0 && <span className="text-xs text-red-400">Vencido</span>}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0 space-y-1">
                  <div>
                    <p className="text-xs text-text-muted">Cortes</p>
                    <p className="text-lg font-bold text-text-primary">
                      {isUnlimited ? '∞' : `${cutsLeft}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Días</p>
                    <p className={`text-lg font-bold ${daysLeft > 5 ? 'text-green-400' : daysLeft > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {daysLeft > 0 ? daysLeft : 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones expandidas */}
              {selectedId === sub.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3" onClick={e => e.stopPropagation()}>
                  {/* WhatsApp buttons */}
                  {sub.customer_phone && (
                    <div className="flex gap-2">
                      <a
                        href={buildWhatsAppLink(
                          sub.customer_phone,
                          `¡Hola ${sub.customer_name}! 👋\n\nTu suscripción *${sub.plan.name}* en Artist Studio está activa.\n\n🗓 Válida hasta: *${format(parseISO(sub.expires_at), "d 'de' MMMM yyyy", { locale: es })}*\n💈 Incluye ${sub.cuts_total >= 99 ? 'cortes ilimitados' : `${sub.cuts_total} cortes al mes`}\n\n¡Gracias por ser parte de Artist Studio!`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-900/20 border border-green-800/30 text-green-400 text-xs font-medium hover:bg-green-900/30 transition-colors"
                      >
                        <MessageCircle size={12} />
                        Confirmar
                      </a>
                      <a
                        href={buildWhatsAppLink(
                          sub.customer_phone,
                          daysLeft > 0
                            ? `Hola ${sub.customer_name} 👋\n\nTe recordamos que tu suscripción *${sub.plan.name}* en Artist Studio vence en *${daysLeft} día${daysLeft === 1 ? '' : 's'}* (el ${format(parseISO(sub.expires_at), "d 'de' MMMM", { locale: es })}).\n\n¡Renuévala para seguir disfrutando tus beneficios! 💈`
                            : `Hola ${sub.customer_name} 👋\n\nTu suscripción *${sub.plan.name}* en Artist Studio *venció el ${format(parseISO(sub.expires_at), "d 'de' MMMM", { locale: es })}*.\n\n¡Contáctanos para renovarla y seguir disfrutando tus beneficios! 💈`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-yellow-900/20 border border-yellow-800/30 text-yellow-400 text-xs font-medium hover:bg-yellow-900/30 transition-colors"
                      >
                        <MessageCircle size={12} />
                        Recordar ({daysLeft > 0 ? `${daysLeft}d` : 'Vencido'})
                      </a>
                    </div>
                  )}

                  {/* Marcar corte usado */}
                  {sub.status === 'active' && (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => addCut(sub)}
                      disabled={!isUnlimited && cutsLeft <= 0}
                    >
                      <Scissors size={14} className="mr-2" />
                      {isUnlimited || cutsLeft > 0 ? 'Marcar 1 corte usado' : 'Cortes agotados'}
                    </Button>
                  )}

                  {/* Cambiar estado */}
                  <div className="grid grid-cols-2 gap-2">
                    {sub.status !== 'active' && (
                      <button
                        onClick={() => updateStatus(sub.id, 'active')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-900/20 border border-green-800/30 text-green-400 text-xs font-medium hover:bg-green-900/30 transition-colors"
                      >
                        <Check size={12} />
                        Activar
                      </button>
                    )}
                    {sub.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(sub.id, 'cancelled')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-xs font-medium hover:bg-red-900/30 transition-colors"
                      >
                        <X size={12} />
                        Cancelar
                      </button>
                    )}
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-text-muted bg-bg-tertiary rounded-lg p-2">
                      📝 {sub.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {subscriptions.length === 0 && (
        <div className="card p-12 text-center">
          <Crown size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay suscripciones aún</p>
          <p className="text-text-muted text-sm mt-1">Cuando un cliente adquiera un plan, aparecerá aquí</p>
        </div>
      )}
    </div>
  )
}
