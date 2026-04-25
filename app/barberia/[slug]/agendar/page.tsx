import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BookingFlow } from '@/components/booking/BookingFlow'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ barbero?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('barbershops')
    .select('name')
    .eq('slug', slug)
    .single()
  return { title: `Agendar cita — ${data?.name ?? 'Barbería'}` }
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { barbero: initialBarberId } = await searchParams
  const supabase = await createClient()

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!barbershop) notFound()

  const [barbersRes, servicesRes] = await Promise.all([
    supabase
      .from('barbers')
      .select('*')
      .eq('barbershop_id', barbershop.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershop.id)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const barbers = barbersRes.data ?? []
  const services = servicesRes.data ?? []

  if (barbers.length === 0 || services.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">✂️</p>
          <p className="text-text-secondary">La barbería no tiene disponibilidad en este momento.</p>
        </div>
      </div>
    )
  }

  // Validar que el barbero inicial existe
  const validBarberId = initialBarberId && barbers.some((b) => b.id === initialBarberId)
    ? initialBarberId
    : undefined

  return (
    <BookingFlow
      barbershop={barbershop}
      barbers={barbers}
      services={services}
      initialBarberId={validBarberId}
    />
  )
}
