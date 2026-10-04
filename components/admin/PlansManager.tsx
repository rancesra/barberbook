'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, ChevronUp, Crown, EyeOff, Plus, Sparkles } from 'lucide-react'
import { DEFAULT_BADGE } from '@/components/public/PlanCard'
import type { Plan } from '@/types'

type AdminPlan = Plan & { subscribers: number }

/** Lista de planes tal como salen en la página principal, para editarlos. */
export function PlansManager() {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/admin/plans')
    const result = await res.json().catch(() => ({}))
    if (res.ok) {
      setPlans(result.plans)
      setError(null)
    } else {
      setError(result.error ?? 'No se pudieron cargar los planes')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= plans.length) return

    const next = [...plans]
    ;[next[index], next[target]] = [next[target], next[index]]
    setPlans(next)

    const res = await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: next.map((p) => p.id) }),
    })
    if (!res.ok) {
      setError('No se pudo guardar el orden. Intenta de nuevo.')
      load()
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/5 rounded-3xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-text-secondary text-sm">
        Estos son los planes que ven tus clientes en la página principal, en este orden.
      </p>

      {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

      <div className="ios-stagger space-y-3">
        {plans.map((plan, index) => (
          <div key={plan.id} className="card flex items-stretch overflow-hidden">
            {/* Orden */}
            <div className="flex flex-col justify-center border-r border-white/10">
              <button
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Subir ${plan.name}`}
                className="px-3 py-2.5 text-text-muted hover:text-text-primary disabled:opacity-25 transition-colors"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === plans.length - 1}
                aria-label={`Bajar ${plan.name}`}
                className="px-3 py-2.5 text-text-muted hover:text-text-primary disabled:opacity-25 transition-colors"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Datos del plan */}
            <Link
              href={`/admin/suscripciones/planes/${plan.id}`}
              className="flex-1 min-w-0 flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: plan.color, boxShadow: `0 0 12px ${plan.color}80` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-semibold ${plan.is_active ? 'text-text-primary' : 'text-text-muted'}`}>
                    {plan.name}
                  </p>
                  {plan.is_popular && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/25">
                      <Sparkles size={10} />
                      {plan.badge_text || DEFAULT_BADGE}
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
                      <EyeOff size={10} />
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-xs mt-1">
                  ${Number(plan.price).toLocaleString('es-CO')}/mes ·{' '}
                  {plan.cuts_per_month >= 99 ? 'Ilimitados' : `${plan.cuts_per_month} cortes`} ·{' '}
                  {plan.benefits.length} beneficio{plan.benefits.length === 1 ? '' : 's'}
                </p>
                {plan.subscribers > 0 && (
                  <p className="text-text-muted text-xs mt-0.5">
                    {plan.subscribers} cliente{plan.subscribers === 1 ? '' : 's'} activo{plan.subscribers === 1 ? '' : 's'}
                  </p>
                )}
              </div>
              <ChevronRight size={18} className="text-text-muted flex-shrink-0" />
            </Link>
          </div>
        ))}
      </div>

      {plans.length === 0 && !error && (
        <div className="card p-12 text-center">
          <Crown size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">Aún no tienes planes</p>
          <p className="text-text-muted text-sm mt-1">Cuando crees uno, aparece en la página principal</p>
        </div>
      )}

      <Link
        href="/admin/suscripciones/planes/nuevo"
        className="glass flex items-center justify-center gap-2 py-3.5 rounded-full text-gold text-sm font-semibold hover:bg-white/10 transition-colors ios-press"
      >
        <Plus size={16} />
        Agregar plan
      </Link>
    </div>
  )
}
