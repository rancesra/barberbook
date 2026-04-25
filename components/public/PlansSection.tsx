'use client'
import { Check, Crown, MessageCircle } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import type { Barbershop } from '@/types'

interface Plan {
  id: string
  name: string
  subtitle: string | null
  price: number
  cuts_per_month: number
  benefits: string[]
  is_popular: boolean
  color: string
}

interface PlansSectionProps {
  plans: Plan[]
  barbershop: Barbershop
}

export function PlansSection({ plans, barbershop }: PlansSectionProps) {
  const { user } = useUser()
  const userName = user?.user_metadata?.name || user?.email || ''

  const buildPlanWhatsApp = (plan: Plan) => {
    const message = user
      ? `Hola, soy ${userName}. Quiero adquirir el Plan *${plan.name}* de ${barbershop.name}. ¿Cómo procedo?`
      : `Hola, quiero adquirir el Plan *${plan.name}* de ${barbershop.name}. ¿Cómo procedo?`

    return barbershop.whatsapp
      ? buildWhatsAppLink(barbershop.whatsapp, message)
      : '#'
  }

  if (plans.length === 0) return null

  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-1.5 mb-4">
          <Crown size={14} className="text-gold" />
          <span className="text-gold text-xs font-medium">Planes de suscripción</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
          Ahorra con un plan mensual
        </h2>
        <p className="text-text-secondary mt-2 text-sm max-w-sm mx-auto">
          Suscríbete y olvídate de pagar cada vez. Tu barbero te espera.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border flex flex-col transition-all duration-200 ${
              plan.is_popular
                ? 'border-gold bg-gold/5 scale-[1.02]'
                : 'border-border bg-bg-secondary'
            }`}
          >
            {/* Badge más popular */}
            {plan.is_popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-bg-primary text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  ⭐ Más popular
                </span>
              </div>
            )}

            {/* Header del plan */}
            <div
              className="p-5 rounded-t-2xl"
              style={{ backgroundColor: `${plan.color}20`, borderBottom: `1px solid ${plan.color}30` }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: plan.color }}>
                {plan.subtitle}
              </p>
              <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-text-primary">
                  ${plan.price.toLocaleString('es-CO')}
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
                {plan.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${plan.color}25` }}
                    >
                      <Check size={10} style={{ color: plan.color }} />
                    </div>
                    <span className="text-text-secondary text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="p-5 pt-0">
              <a
                href={buildPlanWhatsApp(plan)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                  plan.is_popular
                    ? 'bg-gold text-bg-primary hover:bg-gold-light'
                    : 'bg-bg-tertiary text-text-primary border border-border hover:border-border-light'
                }`}
              >
                <MessageCircle size={15} />
                Adquirir por WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-text-muted text-xs mt-6">
        El pago se coordina por WhatsApp. Una vez confirmado, activamos tu plan.
      </p>
    </section>
  )
}
