import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TZ = 'America/Bogota'

export async function GET(req: NextRequest) {
  // Requiere autenticación
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Mes a consultar: por defecto el mes anterior
  const monthParam = req.nextUrl.searchParams.get('month') // formato: "2026-04"
  const now = toZonedTime(new Date(), TZ)

  let targetDate: Date
  if (monthParam) {
    const [year, month] = monthParam.split('-').map(Number)
    targetDate = toZonedTime(new Date(year, month - 1, 1), TZ)
  } else {
    targetDate = subMonths(now, 1)
  }

  const rangeStart = fromZonedTime(startOfMonth(targetDate), TZ).toISOString()
  const rangeEnd   = fromZonedTime(endOfMonth(targetDate), TZ).toISOString()

  const supabase = createAdminClient()

  // Obtener barbero principal
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .single()

  if (!barber) return NextResponse.json({ error: 'No hay barbero' }, { status: 404 })

  // Obtener citas del mes
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, status, service:services(name, price), customer:customers(name, phone)')
    .eq('barber_id', barber.id)
    .gte('start_time', rangeStart)
    .lte('start_time', rangeEnd)
    .neq('status', 'cancelled')
    .order('start_time', { ascending: true })

  return NextResponse.json({
    barberName: barber.name,
    month: targetDate.toISOString(),
    appointments: appointments ?? [],
  })
}
