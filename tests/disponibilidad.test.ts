import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { calculateAvailability } from '@/lib/availability'
import type { Appointment, BlockedDate } from '@/types'
import { appointment, bogota, BREAKS, NOW, TIMEZONE, WORKING_HOURS } from './helpers/agenda'

function horarios({ appointments = [] as Appointment[], blocked = [] as BlockedDate[] } = {}) {
  return calculateAvailability({
    barberId: 'andres',
    durationMinutes: 60, // todos los servicios duran 60 min
    workingHours: WORKING_HOURS,
    breaks: BREAKS,
    existingAppointments: appointments,
    blockedDates: blocked,
    timezone: TIMEZONE,
  })
}

const horas = (date: string, days = horarios()) => days.find((d) => d.date === date)?.slots.map((s) => s.label)

// Vercel corre en hora UTC; el computador de pruebas, en hora de Colombia.
// Las horas que ve el cliente deben ser las mismas en los dos.
describe.each(['UTC', 'America/Bogota'])('Horarios que se ofrecen (servidor en %s)', (tz) => {
  const originalTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = tz
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(NOW)) // lunes 5 de octubre, 10:05 am
  })

  afterAll(() => {
    vi.useRealTimers()
    process.env.TZ = originalTz
  })

  it(`el reloj de la prueba de verdad está en ${tz}`, () => {
    expect(new Date(NOW).getTimezoneOffset()).toBe(tz === 'UTC' ? 0 : 300)
  })

  it('no ofrece horas que ya pasaron', () => {
    const today = horarios().find((d) => d.label === 'Hoy')!
    expect(today.date).toBe('2026-10-05')
    expect(today.slots[0].label).toBe('10:30 am')
    for (const slot of today.slots) {
      expect(new Date(slot.startTime).getTime()).toBeGreaterThan(Date.now())
    }
  })

  it('respeta el horario de atención y la hora de almuerzo', () => {
    expect(horas('2026-10-07')).toEqual([
      '8:30 am', '9:30 am', '10:30 am', '11:30 am',
      // 12:30 – 1:30 pm: almuerzo
      '1:30 pm', '2:30 pm', '3:30 pm', '4:30 pm', '5:30 pm', '6:30 pm', '7:30 pm',
    ])
  })

  it('el último turno termina justo a la hora de cierre, no después', () => {
    const wednesday = horarios().find((d) => d.date === '2026-10-07')!
    expect(wednesday.slots.at(-1)!.endTime).toBe(bogota('2026-10-07', '20:30'))
  })

  it('el martes solo atiende hasta la 1:30 pm', () => {
    expect(horas('2026-10-06')).toEqual(['8:30 am', '9:30 am', '10:30 am', '11:30 am', '12:30 pm'])
  })

  it('el sábado cierra a las 6:30 pm', () => {
    expect(horas('2026-10-10')?.at(-1)).toBe('5:30 pm')
  })

  it('el domingo no se atiende', () => {
    const sunday = horarios().find((d) => d.date === '2026-10-11')!
    expect(sunday.status).toBe('closed')
    expect(sunday.slots).toEqual([])
  })

  it('una hora ya agendada no se le ofrece a nadie más', () => {
    const list = horas('2026-10-05', horarios({ appointments: [appointment('2026-10-05', '14:30', '15:30')] }))
    expect(list).not.toContain('2:30 pm')
    expect(list).toContain('3:30 pm')
  })

  it('una cita que no cae en punto bloquea las dos horas que toca', () => {
    // Andrés agendó a alguien de 3:00 a 4:00 desde el panel
    const list = horas('2026-10-05', horarios({ appointments: [appointment('2026-10-05', '15:00', '16:00')] }))
    expect(list).not.toContain('2:30 pm')
    expect(list).not.toContain('3:30 pm')
    expect(list).toContain('4:30 pm')
  })

  it('una cita cancelada libera la hora', () => {
    const list = horas('2026-10-05', horarios({ appointments: [appointment('2026-10-05', '14:30', '15:30', 'cancelled')] }))
    expect(list).toContain('2:30 pm')
  })

  it('una cita de las 7:30 pm (en UTC ya es el día siguiente) bloquea el día correcto', () => {
    const days = horarios({ appointments: [appointment('2026-10-05', '19:30', '20:30')] })
    expect(horas('2026-10-05', days)).not.toContain('7:30 pm')
    expect(horas('2026-10-06', days)).toContain('8:30 am')
  })

  it('un día bloqueado no tiene horas', () => {
    const blocked = [{ id: 'b1', date: '2026-10-07', barber_id: 'andres' } as BlockedDate]
    const wednesday = horarios({ blocked }).find((d) => d.date === '2026-10-07')!
    expect(wednesday.slots).toEqual([])
    expect(wednesday.available).toBe(false)
  })

  it('marca "quedan pocos" cuando quedan 2 horas o menos', () => {
    const busy = ['10:30', '11:30', '13:30', '14:30', '15:30', '16:30', '17:30'].map((h) => {
      const end = `${String(Number(h.slice(0, 2)) + 1).padStart(2, '0')}${h.slice(2)}`
      return appointment('2026-10-05', h, end)
    })
    const today = horarios({ appointments: busy }).find((d) => d.date === '2026-10-05')!
    expect(today.slots.map((s) => s.label)).toEqual(['6:30 pm', '7:30 pm'])
    expect(today.status).toBe('few')
  })
})
