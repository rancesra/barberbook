import { NextRequest, NextResponse } from 'next/server'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPushToAdmin } from '@/lib/push'
import { z } from 'zod'

const TZ = 'America/Bogota'

const CancelSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'El código debe tener 4 dígitos'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CancelSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'El código debe tener 4 dígitos.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Solo se puede cancelar una cita futura que siga activa
    const { data: appointment } = await supabase
      .from('appointments')
      .select('id, start_time, status, service:services(name), customer:customers(name, phone)')
      .eq('cancellation_code', parsed.data.code)
      .neq('status', 'cancelled')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'No encontramos ninguna cita próxima con ese código. Verifica el código o escríbenos por WhatsApp.',
        },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'No pudimos cancelar la cita. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    const startInTz = toZonedTime(parseISO(appointment.start_time), TZ)
    const dateLabel = format(startInTz, "EEEE d 'de' MMMM", { locale: es })
    const timeLabel = format(startInTz, 'h:mm a').replace('AM', 'am').replace('PM', 'pm')

    const customer = appointment.customer as unknown as { name: string; phone: string } | null
    const service = appointment.service as unknown as { name: string } | null

    await sendPushToAdmin({
      title: 'Cita cancelada por el cliente',
      body: `${customer?.name ?? 'Un cliente'} canceló su cita de ${dateLabel} a las ${timeLabel}.`,
      url: '/admin/reservas',
    })

    return NextResponse.json({
      success: true,
      appointment: {
        customerName: customer?.name ?? '',
        serviceName: service?.name ?? '',
        date: dateLabel,
        time: timeLabel,
      },
    })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
