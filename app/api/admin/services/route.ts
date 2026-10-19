import { NextResponse } from 'next/server'
import { getAdminClient, getBarbershopId, jsonError, unauthorized } from '@/lib/admin-auth'

// Todos los servicios, también los ocultos, con cuántas citas tiene cada uno.
export async function GET() {
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const barbershopId = await getBarbershopId(supabase)
  if (!barbershopId) return jsonError('Barbería no encontrada', 404)

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('sort_order')

  if (error) return jsonError(`No se pudieron cargar los servicios: ${error.message}`, 500)

  const counts = await Promise.all(
    (services ?? []).map((service) =>
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('service_id', service.id)
    )
  )

  return NextResponse.json({
    services: (services ?? []).map((service, i) => ({ ...service, appointments: counts[i].count ?? 0 })),
  })
}
