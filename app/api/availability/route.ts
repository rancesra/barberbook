import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateAvailability } from '@/lib/availability'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const barberId = searchParams.get('barberId')
  const serviceId = searchParams.get('serviceId')
  const barbershopId = searchParams.get('barbershopId')

  if (!barberId || !serviceId || !barbershopId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    const [barbershopRes, serviceRes, whRes, brRes, apptRes, blkRes] = await Promise.all([
      supabase.from('barbershops').select('timezone').eq('id', barbershopId).single(),
      supabase.from('services').select('duration_minutes').eq('id', serviceId).single(),
      supabase.from('barber_working_hours').select('*').eq('barber_id', barberId),
      supabase.from('barber_breaks').select('*').eq('barber_id', barberId).eq('is_active', true),
      supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId)
        .neq('status', 'cancelled')
        .gte('start_time', new Date().toISOString()),
      supabase.from('blocked_dates').select('*').eq('barber_id', barberId),
    ])

    if (!barbershopRes.data || !serviceRes.data) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    const days = calculateAvailability({
      barberId,
      durationMinutes: serviceRes.data.duration_minutes,
      workingHours: whRes.data ?? [],
      breaks: brRes.data ?? [],
      existingAppointments: apptRes.data ?? [],
      blockedDates: blkRes.data ?? [],
      timezone: barbershopRes.data.timezone,
    })

    return NextResponse.json({ days }, { status: 200 })
  } catch (error) {
    console.error('Availability error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
