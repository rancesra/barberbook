import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { deleteCalendarEvent } from '@/lib/google-calendar'
import { z } from 'zod'
import type { AppointmentStatus } from '@/types'

const UpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show', 'sync_pending']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verificar autenticación
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const newStatus: AppointmentStatus = parsed.data.status

  // Si se cancela, eliminar del Google Calendar
  if (newStatus === 'cancelled') {
    const { data: appt } = await adminClient
      .from('appointments')
      .select('*, barber:barbers(calendar_id, google_refresh_token)')
      .eq('id', id)
      .single()

    if (appt?.google_calendar_event_id && (appt.barber as Record<string, string>)?.google_refresh_token) {
      const barber = appt.barber as Record<string, string>
      await deleteCalendarEvent(
        appt.google_calendar_event_id,
        barber.calendar_id || 'primary',
        barber.google_refresh_token
      )
    }
  }

  const { data, error } = await adminClient
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error actualizando cita' }, { status: 500 })
  }

  return NextResponse.json({ success: true, appointment: data })
}
