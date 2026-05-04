import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/schedule?barberId=xxx  — carga horarios y breaks
export async function GET(request: NextRequest) {
  const barberId = request.nextUrl.searchParams.get('barberId')
  if (!barberId) return NextResponse.json({ error: 'Falta barberId' }, { status: 400 })

  const supabase = createAdminClient()
  const [hoursRes, breaksRes] = await Promise.all([
    supabase.from('barber_working_hours').select('*').eq('barber_id', barberId),
    supabase.from('barber_breaks').select('*').eq('barber_id', barberId),
  ])

  return NextResponse.json({
    hours: hoursRes.data ?? [],
    breaks: breaksRes.data ?? [],
  })
}

// POST /api/schedule  — guarda horarios y breaks
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { barberId, schedule, breaks } = body

  if (!barberId || !schedule || !breaks) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const errors: string[] = []

  // Guardar horarios de trabajo
  for (const day of schedule) {
    const payload = {
      barber_id: barberId,
      day_of_week: day.day_of_week,
      is_active: day.is_active,
      start_time: day.start_time,
      end_time: day.end_time,
    }
    if (day.id) {
      const { error } = await supabase
        .from('barber_working_hours')
        .update({ is_active: day.is_active, start_time: day.start_time, end_time: day.end_time })
        .eq('id', day.id)
      if (error) errors.push(`working_hours update: ${error.message}`)
    } else {
      const { error } = await supabase.from('barber_working_hours').insert(payload)
      if (error) errors.push(`working_hours insert: ${error.message}`)
    }
  }

  // Guardar breaks
  for (const brk of breaks) {
    const payload = {
      barber_id: barberId,
      day_of_week: brk.day_of_week,
      is_active: brk.is_active,
      start_time: brk.start_time,
      end_time: brk.end_time,
    }
    if (brk.id) {
      const { error } = await supabase
        .from('barber_breaks')
        .update({ is_active: brk.is_active, start_time: brk.start_time, end_time: brk.end_time })
        .eq('id', brk.id)
      if (error) errors.push(`breaks update: ${error.message}`)
    } else if (brk.is_active) {
      // Solo insertar si está activo (evitar filas inútiles)
      const { error } = await supabase.from('barber_breaks').insert(payload)
      if (error) errors.push(`breaks insert: ${error.message}`)
    }
  }

  if (errors.length > 0) {
    console.error('Schedule save errors:', errors)
    return NextResponse.json({ error: errors.join('; ') }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
