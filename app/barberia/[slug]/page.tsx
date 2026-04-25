import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/public/PublicHeader'
import { HeroSection } from '@/components/public/HeroSection'
import { PlansSection } from '@/components/public/PlansSection'
import { LocationSection } from '@/components/public/LocationSection'
import { PublicFooter } from '@/components/public/PublicFooter'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('barbershops')
    .select('name, description')
    .eq('slug', slug)
    .single()
  if (!data) return { title: 'Barbería' }
  return {
    title: `${data.name} — Reserva tu cita`,
    description: data.description ?? undefined,
  }
}

export default async function BarbershopPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!barbershop) notFound()

  const { data: plansData } = await supabase
    .from('plans')
    .select('*')
    .eq('barbershop_id', barbershop.id)
    .eq('is_active', true)
    .order('sort_order')

  const plans = plansData ?? []

  return (
    <div className="bg-bg-primary min-h-screen">
      <PublicHeader barbershop={barbershop} />
      <main>
        <HeroSection barbershop={barbershop} />

        {/* Planes */}
        {plans.length > 0 && (
          <div id="planes">
            <PlansSection plans={plans} barbershop={barbershop} />
          </div>
        )}

        <LocationSection barbershop={barbershop} />
      </main>
      <PublicFooter barbershop={barbershop} />
    </div>
  )
}
