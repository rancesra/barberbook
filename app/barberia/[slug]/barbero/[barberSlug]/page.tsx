import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string; barberSlug: string }>
}

// El link directo por barbero redirige al flujo de reserva con el barbero preseleccionado
export default async function BarberDirectPage({ params }: Props) {
  const { slug, barberSlug } = await params
  const supabase = await createClient()

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!barbershop) notFound()

  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('barbershop_id', barbershop.id)
    .eq('slug', barberSlug)
    .eq('is_active', true)
    .single()

  if (!barber) notFound()

  redirect(`/barberia/${slug}/agendar?barbero=${barber.id}`)
}
