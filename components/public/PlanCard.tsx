import { Check, MessageCircle } from 'lucide-react'
import type { Plan } from '@/types'

export const DEFAULT_BADGE = 'Más popular'

export type PlanCardData = Pick<
  Plan,
  'name' | 'subtitle' | 'price' | 'cuts_per_month' | 'benefits' | 'is_popular' | 'badge_text' | 'color'
>

interface PlanCardProps {
  plan: PlanCardData
  /** Link del botón de WhatsApp. Sin él (vista previa del panel) el botón no navega. */
  href?: string
}

/** Tarjeta de un plan, tal como la ve el cliente en la página. */
export function PlanCard({ plan, href }: PlanCardProps) {
  const ctaClass = `w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-semibold text-sm transition-all duration-200 ios-press ${
    plan.is_popular
      ? 'glass-gold text-bg-primary hover:brightness-110'
      : 'glass text-text-primary hover:bg-white/10'
  }`

  return (
    <div
      className={`relative rounded-3xl flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 ${
        plan.is_popular
          ? 'glass-strong border-gold/45 ring-1 ring-gold/25'
          : 'glass hover:bg-white/10'
      }`}
    >
      {/* Etiqueta del destacado */}
      {plan.is_popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="glass-gold text-bg-primary text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
            {plan.badge_text || DEFAULT_BADGE}
          </span>
        </div>
      )}

      {/* Header del plan */}
      <div
        className="p-5 rounded-t-3xl"
        style={{ backgroundColor: `${plan.color}20`, borderBottom: `1px solid ${plan.color}30` }}
      >
        {plan.subtitle && (
          <p className="text-xs font-medium mb-1" style={{ color: plan.color }}>
            {plan.subtitle}
          </p>
        )}
        <h3 className="text-xl font-bold text-text-primary break-words">{plan.name || 'Nombre del plan'}</h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-3xl font-bold text-text-primary">
            ${Number(plan.price || 0).toLocaleString('es-CO')}
          </span>
          <span className="text-text-muted text-sm mb-1">/mes</span>
        </div>
        <p className="text-xs mt-1" style={{ color: plan.color }}>
          {plan.cuts_per_month >= 99 ? 'Cortes ilimitados' : `${plan.cuts_per_month} cortes al mes`}
        </p>
      </div>

      {/* Beneficios */}
      <div className="p-5 flex-1">
        <ul className="space-y-2.5">
          {plan.benefits.filter((b) => b.trim()).map((benefit, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${plan.color}25` }}
              >
                <Check size={10} style={{ color: plan.color }} />
              </div>
              <span className="text-text-secondary text-sm break-words min-w-0">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-5 pt-0">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={ctaClass}>
            <MessageCircle size={15} />
            Adquirir por WhatsApp
          </a>
        ) : (
          <span className={ctaClass} aria-hidden="true">
            <MessageCircle size={15} />
            Adquirir por WhatsApp
          </span>
        )}
      </div>
    </div>
  )
}
