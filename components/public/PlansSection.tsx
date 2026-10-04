'use client'
import { Crown } from 'lucide-react'
import { buildWhatsAppLink } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { PlanCard } from '@/components/public/PlanCard'
import type { Barbershop, Plan } from '@/types'

interface PlansSectionProps {
  plans: Plan[]
  barbershop: Barbershop
}

/** Columnas según cuántos planes haya, para que ninguno quede huérfano. */
function gridFor(count: number): string {
  if (count === 1) return 'max-w-sm'
  if (count === 2) return 'sm:grid-cols-2 max-w-3xl'
  if (count === 4) return 'sm:grid-cols-2 lg:grid-cols-4'
  return 'sm:grid-cols-3'
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
        <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4">
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

      <div className={`grid grid-cols-1 gap-x-4 gap-y-6 mx-auto ${gridFor(plans.length)}`}>
        {plans.map((plan) => (
          <div key={plan.id} className={`ios-step ${plan.is_popular ? 'sm:scale-[1.03]' : ''}`}>
            <PlanCard plan={plan} href={buildPlanWhatsApp(plan)} />
          </div>
        ))}
      </div>

      <p className="text-center text-text-muted text-xs mt-6">
        El pago se coordina por WhatsApp. Una vez confirmado, activamos tu plan.
      </p>
    </section>
  )
}
