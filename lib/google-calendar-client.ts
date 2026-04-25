// Google Calendar para el CLIENTE (usando su propio token de Google)

interface CalendarEventInput {
  title: string
  description: string
  startTime: string // ISO string
  endTime: string
  location?: string
  accessToken: string
}

export async function addToClientCalendar(input: CalendarEventInput): Promise<{ success: boolean; eventId?: string }> {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description,
        location: input.location,
        start: { dateTime: input.startTime },
        end: { dateTime: input.endTime },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'email', minutes: 60 },
          ],
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Error al crear evento en Google Calendar')
    }

    const data = await response.json()
    return { success: true, eventId: data.id }
  } catch (error) {
    console.error('Client calendar error:', error)
    return { success: false }
  }
}
