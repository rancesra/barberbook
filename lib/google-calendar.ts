import { google } from 'googleapis'
import { format } from 'date-fns'
import type { Appointment, Barber, Service, Customer, Barbershop } from '@/types'

interface CreateEventInput {
  appointment: Appointment
  barber: Barber
  service: Service
  customer: Customer
  barbershop: Barbershop
}

interface CalendarEventResult {
  success: boolean
  eventId?: string
  error?: string
}

function getOAuth2Client() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  return oauth2Client
}

export async function createCalendarEvent(
  input: CreateEventInput,
  refreshToken: string
): Promise<CalendarEventResult> {
  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const { appointment, barber, service, customer, barbershop } = input

    const eventTitle = `Cita - ${customer.name}`
    const description = [
      `👤 Cliente: ${customer.name}`,
      `📱 Teléfono: ${customer.phone}`,
      customer.email ? `📧 Correo: ${customer.email}` : null,
      `✂️ Servicio: ${service.name}`,
      `⏱ Duración: ${service.duration_minutes} min`,
      `💈 Barbería: ${barbershop.name}`,
      `📍 Dirección: ${barbershop.address || 'Ver dirección en la app'}`,
      appointment.notes ? `📝 Nota: ${appointment.notes}` : null,
      '',
      `🔗 Origen: Reserva web BarberBook`,
      `📅 Creada: ${format(new Date(), "d 'de' MMMM yyyy, HH:mm")}`,
    ]
      .filter(Boolean)
      .join('\n')

    const calendarId = barber.calendar_id || 'primary'

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: eventTitle,
        description,
        start: {
          dateTime: appointment.start_time,
          timeZone: barbershop.timezone,
        },
        end: {
          dateTime: appointment.end_time,
          timeZone: barbershop.timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
        colorId: '2', // Verde para citas confirmadas
      },
    })

    return {
      success: true,
      eventId: response.data.id || undefined,
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

export async function deleteCalendarEvent(
  eventId: string,
  calendarId: string,
  refreshToken: string
): Promise<boolean> {
  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    await calendar.events.delete({ calendarId, eventId })
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}

// Verificar disponibilidad contra Google Calendar
export async function getCalendarBusySlots(
  calendarId: string,
  refreshToken: string,
  timeMin: string,
  timeMax: string
): Promise<{ start: string; end: string }[]> {
  try {
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ refresh_token: refreshToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      },
    })

    const busy = response.data.calendars?.[calendarId]?.busy || []
    return busy.map((slot) => ({
      start: slot.start || '',
      end: slot.end || '',
    }))
  } catch (error) {
    console.error('Error checking calendar busy slots:', error)
    return []
  }
}
