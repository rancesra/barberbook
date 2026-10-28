import { describe, expect, it } from 'vitest'
import { appointmentPrice } from '@/lib/utils'

describe('Ingresos: cada cita cuenta lo que valía el día que se agendó', () => {
  it('usa el precio guardado en la cita, aunque el servicio haya subido de precio', () => {
    // El Corte se agendó a $33.000 y después subió a $35.000
    expect(appointmentPrice({ price: 33000, service: { price: 35000 } })).toBe(33000)
  })

  it('subir un precio no cambia los ingresos de las citas pasadas', () => {
    const pasadas = [
      { price: 33000, service: { price: 35000 } },
      { price: 33000, service: { price: 35000 } },
      { price: 45000, service: { price: 50000 } },
    ]
    expect(pasadas.reduce((sum, cita) => sum + appointmentPrice(cita), 0)).toBe(111000)
  })

  it('una cita sin precio guardado usa el precio actual del servicio', () => {
    expect(appointmentPrice({ price: null, service: { price: 20000 } })).toBe(20000)
    expect(appointmentPrice({ service: { price: 20000 } })).toBe(20000)
  })

  it('entiende los precios que llegan como texto desde la base de datos', () => {
    expect(appointmentPrice({ price: '33000.00', service: null })).toBe(33000)
  })

  it('sin precio ni servicio cuenta 0, no rompe la suma', () => {
    expect(appointmentPrice({ price: null, service: null })).toBe(0)
  })
})
