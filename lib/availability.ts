import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  addDays,
  isSameDay,
} from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import type {
  BarberWorkingHours,
  BarberBreak,
  Appointment,
  BlockedDate,
  TimeSlot,
  DayAvailability,
} from '@/types'

interface AvailabilityInput {
  barberId: string
  durationMinutes: number
  workingHours: BarberWorkingHours[]
  breaks: BarberBreak[]
  existingAppointments: Appointment[]
  blockedDates: BlockedDate[]
  timezone: string
  daysAhead?: number
}

function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  let d = setHours(baseDate, hours)
  d = setMinutes(d, minutes)
  d = setSeconds(d, 0)
  return d
}

function generateSlotsForDay(
  date: Date,
  startTime: string,
  endTime: string,
  durationMinutes: number,
  breaks: BarberBreak[],
  existingAppointments: Appointment[],
  blockedDates: BlockedDate[],
  timezone: string
): TimeSlot[] {
  const now = new Date()
  const dayOfWeek = date.getDay()

  // Verificar si el día está bloqueado
  const dateStr = format(date, 'yyyy-MM-dd')
  const isBlocked = blockedDates.some((bd) => bd.date === dateStr)
  if (isBlocked) return []

  const dayStart = parseTime(startTime, date)
  const dayEnd = parseTime(endTime, date)

  const dayBreaks = breaks
    .filter((b) => b.day_of_week === dayOfWeek && b.is_active)
    .map((b) => ({
      start: parseTime(b.start_time, date),
      end: parseTime(b.end_time, date),
    }))

  const dayAppointments = existingAppointments
    .filter((a) => {
      const apptDate = toZonedTime(parseISO(a.start_time), timezone)
      return isSameDay(apptDate, date) && a.status !== 'cancelled'
    })
    .map((a) => ({
      start: toZonedTime(parseISO(a.start_time), timezone),
      end: toZonedTime(parseISO(a.end_time), timezone),
    }))

  const slots: TimeSlot[] = []
  let slotStart = dayStart

  while (isBefore(addMinutes(slotStart, durationMinutes), dayEnd) ||
         addMinutes(slotStart, durationMinutes).getTime() === dayEnd.getTime()) {
    const slotEnd = addMinutes(slotStart, durationMinutes)

    // No mostrar slots pasados
    const slotStartUtc = fromZonedTime(slotStart, timezone)
    if (isBefore(slotStartUtc, now)) {
      slotStart = addMinutes(slotStart, durationMinutes)
      continue
    }

    // Verificar si choca con descanso
    const overlapsBreak = dayBreaks.some(
      (b) => isBefore(slotStart, b.end) && isAfter(slotEnd, b.start)
    )

    // Verificar si choca con cita existente
    const overlapsAppointment = dayAppointments.some(
      (a) => isBefore(slotStart, a.end) && isAfter(slotEnd, a.start)
    )

    const available = !overlapsBreak && !overlapsAppointment

    slots.push({
      startTime: fromZonedTime(slotStart, timezone).toISOString(),
      endTime: fromZonedTime(slotEnd, timezone).toISOString(),
      available,
      label: format(slotStart, 'h:mm a').replace('AM', 'am').replace('PM', 'pm'),
    })

    slotStart = addMinutes(slotStart, durationMinutes)
  }

  return slots
}

export function calculateAvailability(input: AvailabilityInput): DayAvailability[] {
  const {
    durationMinutes,
    workingHours,
    breaks,
    existingAppointments,
    blockedDates,
    timezone,
    daysAhead = 7,
  } = input

  const now = new Date()
  const todayInTz = toZonedTime(now, timezone)
  const result: DayAvailability[] = []

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = startOfDay(addDays(todayInTz, i))
    const dayOfWeek = targetDate.getDay()
    const dateStr = format(targetDate, 'yyyy-MM-dd')

    const workingDay = workingHours.find(
      (wh) => wh.day_of_week === dayOfWeek && wh.is_active
    )

    const isBlocked = blockedDates.some((bd) => bd.date === dateStr)

    let label: string
    if (i === 0) label = 'Hoy'
    else if (i === 1) label = 'Mañana'
    else {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      label = `${days[dayOfWeek]} ${format(targetDate, 'd')}`
    }

    if (!workingDay || isBlocked) {
      result.push({
        date: dateStr,
        label,
        dayOfWeek,
        available: false,
        slotsCount: 0,
        slots: [],
        status: isBlocked ? 'closed' : 'closed',
      })
      continue
    }

    const slots = generateSlotsForDay(
      targetDate,
      workingDay.start_time,
      workingDay.end_time,
      durationMinutes,
      breaks,
      existingAppointments,
      blockedDates,
      timezone
    )

    const availableSlots = slots.filter((s) => s.available)
    const totalSlots = slots.length
    const slotsCount = availableSlots.length

    let status: DayAvailability['status']
    if (slotsCount === 0) status = 'full'
    else if (slotsCount <= 2) status = 'few'
    else status = 'open'

    result.push({
      date: dateStr,
      label,
      dayOfWeek,
      available: slotsCount > 0,
      slotsCount,
      slots: availableSlots, // Solo slots disponibles al cliente
      status,
    })
  }

  return result
}

export function getNextAvailableSlot(days: DayAvailability[]): string | null {
  for (const day of days) {
    if (day.slots.length > 0) {
      return `${day.label} ${day.slots[0].label}`
    }
  }
  return null
}
