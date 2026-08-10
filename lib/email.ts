/**
 * Resend — notificaciones por correo al barbero/admin
 * Docs: https://resend.com/docs
 *
 * Env vars needed:
 *   RESEND_API_KEY     → API key del dashboard de Resend
 *   RESEND_FROM_EMAIL   → remitente verificado (por defecto el sandbox de Resend)
 */
import { Resend } from 'resend'

interface AppointmentEmailDetails {
  to: string
  customerName: string
  customerPhone: string
  serviceName: string
  barberName: string
  date: string // e.g. "lunes 5 de mayo"
  time: string // e.g. "10:00 am"
}

export async function sendAppointmentEmail(details: AppointmentEmailDetails): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY no configurado — se omite el correo')
    return
  }

  if (!details.to) {
    console.warn('[Email] notification_email no configurado en la barbería — se omite el correo')
    return
  }

  const subject = `Nueva cita: ${details.customerName} — ${details.date} ${details.time}`

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Nueva reserva</h2>
      <p><strong>Cliente:</strong> ${details.customerName}</p>
      <p><strong>Teléfono:</strong> ${details.customerPhone}</p>
      <p><strong>Servicio:</strong> ${details.serviceName}</p>
      <p><strong>Barbero:</strong> ${details.barberName}</p>
      <p><strong>Fecha:</strong> ${details.date}</p>
      <p><strong>Hora:</strong> ${details.time}</p>
    </div>
  `

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `BarberBook <${from}>`,
      to: details.to,
      subject,
      html,
    })

    if (error) {
      console.error('[Email] Error enviando correo:', error)
    } else {
      console.log('[Email] Notificación enviada a', details.to)
    }
  } catch (err) {
    console.error('[Email] Error de red:', err)
  }
}
