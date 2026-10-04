import type { Appointment, BarberBreak, BarberWorkingHours } from '@/types'

// El horario real de Andrés (copiado de la base de datos el 4 de octubre de 2026).

export const BARBER_ID = '1e24fa59-1662-40b7-acbf-a56583a1569f'
export const SHOP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
export const SERVICE_ID = '6f1c2d3e-4a5b-4c6d-8e7f-9a0b1c2d3e4f'
export const TIMEZONE = 'America/Bogota'

const day = (day_of_week: number, start: string, end: string, is_active = true) =>
  ({ id: `wh-${day_of_week}`, barber_id: BARBER_ID, day_of_week, start_time: `${start}:00`, end_time: `${end}:00`, is_active }) as BarberWorkingHours

export const WORKING_HOURS = [
  day(0, '08:30', '19:30', false), // domingo: cerrado
  day(1, '08:30', '20:30'),
  day(2, '08:30', '13:30'), // martes: medio día
  day(3, '08:30', '20:30'),
  day(4, '08:30', '20:30'),
  day(5, '08:30', '20:30'),
  day(6, '08:30', '18:30'),
]

const lunch = (day_of_week: number, is_active = true) =>
  ({ id: `br-${day_of_week}`, barber_id: BARBER_ID, day_of_week, start_time: '12:30:00', end_time: '13:30:00', is_active }) as BarberBreak

export const BREAKS = [lunch(1), lunch(2, false), lunch(3), lunch(4), lunch(5), lunch(6)]

/** Hora de Colombia → instante UTC en ISO. Colombia es UTC-5 todo el año. */
export const bogota = (date: string, time: string) => new Date(`${date}T${time}:00-05:00`).toISOString()

/** "Ahora" de las pruebas: lunes 5 de octubre de 2026, 10:05 am en Colombia. */
export const NOW = bogota('2026-10-05', '10:05')

export function appointment(date: string, start: string, end: string, status = 'confirmed'): Appointment {
  return {
    id: `cita-${date}-${start}`,
    barber_id: BARBER_ID,
    start_time: bogota(date, start),
    end_time: bogota(date, end),
    status,
  } as Appointment
}
