/**
 * Sent.dm — WhatsApp reminder integration
 * Docs: https://docs.sent.dm
 *
 * Env vars needed:
 *   SENT_DM_API_KEY      → API key from sent.dm dashboard
 *   SENT_DM_TEMPLATE_ID  → UUID of the approved WhatsApp template
 */

interface ReminderParams {
  phone: string        // 10 digits, e.g. "3156669991"
  customerName: string
  date: string         // e.g. "lunes 5 de mayo"
  time: string         // e.g. "10:00 am"
  barberName: string
}

export async function sendWhatsAppReminder(params: ReminderParams): Promise<void> {
  const apiKey = process.env.SENT_DM_API_KEY
  const templateId = process.env.SENT_DM_TEMPLATE_ID

  if (!apiKey || !templateId) {
    console.warn('[Sent] SENT_DM_API_KEY o SENT_DM_TEMPLATE_ID no configurados — se omite el recordatorio')
    return
  }

  // Formato E.164 Colombia
  const e164Phone = `+57${params.phone.replace(/\D/g, '')}`

  try {
    const res = await fetch('https://api.sent.dm/v3/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        to: [e164Phone],
        channel: ['whatsapp'],
        template: {
          id: templateId,
          parameters: {
            name: params.customerName,
            date: params.date,
            time: params.time,
            barber: params.barberName,
          },
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Sent] Error enviando recordatorio:', err)
    } else {
      console.log('[Sent] Recordatorio enviado a', e164Phone)
    }
  } catch (err) {
    console.error('[Sent] Error de red:', err)
  }
}
