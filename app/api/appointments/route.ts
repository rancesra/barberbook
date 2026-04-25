import { NextRequest, NextResponse } from 'next/server'
import { addMinutes, parseISO } from 'date-fns'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateAvailability } from '@/lib/availability'
import { createCalendarEvent } from '@/lib/google-calendar'
import { z } from 'zod'

const CreateAppointmentSchema = z.object({
  barbershop_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  service_id: z.string().uuid(),
  customer: z.object({
    name: z.string().min(2).max(255),
    phone: z.string().min(7).max(30),
    email: z.string().email().optional(),
  }),
  start_time: z.string().datetime(),
  notes: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateAppointmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos: ' + parsed.error.errors[0]?.message },
        { status: 400 }
      )
    }

    const { barbershop_id, barber_id, service_id, customer, start_time, notes } = parsed.data
    const supabase = createAdminClient()

    // 1. Cargar datos necesarios
    const [barbershopRes, serviceRes, barberRes] = await Promise.all([
      supabase.from('barbershops').select('*').eq('id', barbershop_id).single(),
      supabase.from('services').select('*').eq('id', service_id).single(),
      supabase.from('barbers').select('*').eq('id', barber_id).single(),
    ])

    if (!barbershopRes.data || !serviceRes.data || !barberRes.data) {
      return NextResponse.json(
        { success: false, error: 'Datos de la barbería no encontrados' },
        { status: 404 }
      )
    }

    const barbershop = barbershopRes.data
    const service = serviceRes.data
    const barber = barberRes.data

    const end_time = addMinutes(parseISO(start_time), service.duration_minutes).toISOString()

    // 2. Verificar disponibilidad (doble check antes de crear)
    const [whRes, brRes, apptRes, blkRes] = await Promise.all([
      supabase.from('barber_working_hours').select('*').eq('barber_id', barber_id),
      supabase.from('barber_breaks').select('*').eq('barber_id', barber_id).eq('is_active', true),
      supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barber_id)
        .neq('status', 'cancelled')
        .gte('start_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from('blocked_dates').select('*').eq('barber_id', barber_id),
    ])

    const availability = calculateAvailability({
      barberId: barber_id,
      durationMinutes: service.duration_minutes,
      workingHours: whRes.data ?? [],
      breaks: brRes.data ?? [],
      existingAppointments: apptRes.data ?? [],
      blockedDates: blkRes.data ?? [],
      timezone: barbershop.timezone,
    })

    const startTimestamp = parseISO(start_time).getTime()
    const isSlotAvailable = availability.some((day) =>
      day.slots.some(
        (slot) => slot.available && parseISO(slot.startTime).getTime() === startTimestamp
      )
    )

    if (!isSlotAvailable) {
      return NextResponse.json(
        { success: false, error: 'Lo sentimos, ese horario ya no está disponible. Por favor elige otro.' },
        { status: 409 }
      )
    }

    // 3. Crear o buscar cliente
    let customerId: string
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', customer.phone)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Actualizar nombre si cambió
      await supabase
        .from('customers')
        .update({ name: customer.name, email: customer.email ?? null })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({ name: customer.name, phone: customer.phone, email: customer.email ?? null })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        return NextResponse.json(
          { success: false, error: 'Error creando perfil de cliente' },
          { status: 500 }
        )
      }
      customerId = newCustomer.id
    }

    // 4. Crear la cita
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        barbershop_id,
        barber_id,
        service_id,
        customer_id: customerId,
        start_time,
        end_time,
        status: 'confirmed',
        notes: notes ?? null,
      })
      .select('*')
      .single()

    if (apptError || !appointment) {
      // Si falla por exclusión (doble reserva), devolver error amigable
      if (apptError?.code === 'P0001' || apptError?.message?.includes('overlap')) {
        return NextResponse.json(
          { success: false, error: 'Ese horario fue tomado en este momento. Por favor elige otro.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Error creando la cita. Por favor intenta de nuevo.' },
        { status: 500 }
      )
    }

    // 5. Intentar crear evento en Google Calendar
    if (barber.google_refresh_token) {
      const calendarResult = await createCalendarEvent(
        {
          appointment,
          barber,
          service,
          customer: { id: customerId, name: customer.name, phone: customer.phone, email: customer.email ?? null, created_at: '', updated_at: '' },
          barbershop,
        },
        barber.google_refresh_token
      )

      if (calendarResult.success && calendarResult.eventId) {
        await supabase
          .from('appointments')
          .update({ google_calendar_event_id: calendarResult.eventId })
          .eq('id', appointment.id)
      } else {
        // Marcar como pendiente de sincronización sin fallar la reserva
        await supabase
          .from('appointments')
          .update({ status: 'sync_pending' })
          .eq('id', appointment.id)
      }
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
