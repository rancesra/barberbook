'use client'
import { Check, Crown, MessageCircle, Sparkles } from 'lucide-react'
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
    <section className="relative px-4 py-20 max-w-5xl mx-auto">
      {/* Glow de fondo */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gold/[0.06] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative text-center mb-12">
        <span className="eyebrow glass gold-ring rounded-full px-4 py-2 text-gold">
          <Crown size={12} />
          Suscripción
        </span>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text-primary mt-5 text-balance">
          Ahorra con un <span className="text-gradient-gold">plan mensual</span>
        </h2>
        <p className="text-text-secondary mt-3 text-sm sm:text-base max-w-md mx-auto text-pretty">
          Suscríbete y olvídate de pagar cada vez. Tu barbero te espera.
        </p>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
        {plans.map((plan) => {
          const popular = plan.is_popular
          return (
            <div
              key={plan.id}
              className={`group relative rounded-3xl flex flex-col transition-all duration-300 ${
                popular
                  ? 'gold-ring bg-gradient-to-b from-gold/[0.08] to-transparent sm:-translate-y-2 shadow-[0_20px_60px_-24px_rgba(201,168,76,0.5)]'
                  : 'border border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {/* Badge popular */}
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-gold text-bg-primary text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-[0_6px_20px_-6px_rgba(201,168,76,0.7)]">
                    <Sparkles size={12} />
                    Más popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="p-6 pb-5">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
                  style={{ color: plan.color }}
                >
                  {plan.subtitle}
                </p>
                <h3 className="font-display font-semibold text-xl text-text-primary">{plan.name}</h3>

                <div className="mt-4 flex items-end gap-1.5">
                  <span className="font-display font-bold text-4xl text-text-primary tracking-tight">
                    ${plan.price.toLocaleString('es-CO')}
                  </span>
                  <span className="text-text-muted text-sm mb-1.5">/mes</span>
                </div>

                <div
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${plan.color}18`, color: plan.color }}
                >
                  <Check size={12} />
                  {plan.cuts_per_month >= 99 ? 'Cortes ilimitados' : `${plan.cuts_per_month} cortes al mes`}
                </div>
              </div>

              {/* Divisor */}
              <div className="mx-6 h-px bg-white/10" />

              {/* Beneficios */}
              <div className="p-6 pt-5 flex-1">
                <ul className="space-y-3">
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: `${plan.color}22` }}
                      >
                        <Check size={11} style={{ color: plan.color }} />
                      </div>
                      <span className="text-text-secondary text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <a
                  href={buildPlanWhatsApp(plan)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
                    popular
                      ? 'bg-gold text-bg-primary hover:bg-gold-light shadow-[0_8px_24px_-10px_rgba(201,168,76,0.7)]'
                      : 'bg-white/[0.04] text-text-primary border border-white/10 hover:border-gold/40 hover:text-gold'
                  }`}
                >
                  <MessageCircle size={15} />
                  Adquirir por WhatsApp
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <p className="relative text-center text-text-muted text-xs mt-8">
        El pago se coordina por WhatsApp. Una vez confirmado, activamos tu plan.
      </p>
    </section>
  )
}
