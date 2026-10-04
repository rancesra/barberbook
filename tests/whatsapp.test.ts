import { describe, expect, it } from 'vitest'
import { buildBookingWhatsAppMessage, buildClientConfirmationMessage, buildWhatsAppLink } from '@/lib/utils'

const cita = {
  customerName: 'Juan Pérez',
  barberName: 'Andrés',
  serviceName: 'Corte + Barba',
  date: 'martes 6 de octubre',
  time: '3:00 pm',
  barbershopName: 'Barbería Artist Studio',
}

/** El texto que de verdad le llega a WhatsApp dentro del link. */
const textInLink = (link: string) => new URL(link).searchParams.get('text')

describe('WhatsApp: mensaje del cliente a la barbería', () => {
  it('lleva todos los datos de la cita', () => {
    expect(buildBookingWhatsAppMessage(cita)).toBe(
      'Hola, soy *Juan Pérez*. Confirmo mi cita en *Barbería Artist Studio* con Andrés para el dia *martes 6 de octubre* a las *3:00 pm*. Servicio: Corte + Barba.'
    )
  })

  it('incluye el código de cancelación', () => {
    expect(buildBookingWhatsAppMessage({ ...cita, cancellationCode: '4821' })).toMatch(
      /\n\nMi codigo de cancelacion es \*4821\*\.$/
    )
  })

  it('sin código no menciona ningún código', () => {
    expect(buildBookingWhatsAppMessage({ ...cita, cancellationCode: null })).not.toMatch(/codigo/)
  })
})

describe('WhatsApp: mensaje de Andrés al cliente (cuando agenda desde el panel)', () => {
  it('lleva todos los datos de la cita y el código', () => {
    expect(buildClientConfirmationMessage({ ...cita, cancellationCode: '4821' })).toBe(
      [
        'Hola, *Juan Pérez*.',
        '',
        'Su cita en *Barbería Artist Studio* ha sido confirmada:',
        '',
        'Fecha: *martes 6 de octubre*',
        'Hora: *3:00 pm*',
        'Servicio: Corte + Barba',
        'Barbero: Andrés',
        '',
        'Su codigo de cancelacion es *4821*. Uselo en la pagina principal si necesita cancelar.',
        '',
        'Le esperamos.',
      ].join('\n')
    )
  })

  it('sin código no deja una línea vacía de más', () => {
    expect(buildClientConfirmationMessage(cita)).toMatch(/Barbero: Andrés\n\nLe esperamos\.$/)
  })
})

describe('WhatsApp: el link', () => {
  it('agrega el +57 si el número no lo tiene', () => {
    expect(buildWhatsAppLink('3001234567', 'Hola')).toMatch(/^https:\/\/wa\.me\/573001234567\?/)
  })

  it('no duplica el +57 si ya lo tiene', () => {
    expect(buildWhatsAppLink('+57 315 666 9991', 'Hola')).toMatch(/^https:\/\/wa\.me\/573156669991\?/)
  })

  it('limpia espacios, guiones y paréntesis del número', () => {
    expect(buildWhatsAppLink('(300) 123-4567', 'Hola')).toMatch(/^https:\/\/wa\.me\/573001234567\?/)
  })

  it('el mensaje llega completo: tildes, ñ, saltos de línea, *, & y #', () => {
    const message = buildClientConfirmationMessage({
      ...cita,
      customerName: 'Begoña Ñúñez & Cía #1',
      cancellationCode: '4821',
    })
    expect(textInLink(buildWhatsAppLink('3001234567', message))).toBe(message)
  })
})
