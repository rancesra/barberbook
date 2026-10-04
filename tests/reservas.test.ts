import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { fakeSupabase, type Op, type Result } from './helpers/fake-supabase'
import { appointment, BARBER_ID, bogota, BREAKS, NOW, SERVICE_ID, SHOP_ID, TIMEZONE, WORKING_HOURS } from './helpers/agenda'
import { POST } from '@/app/api/appointments/route'
import { sendWhatsAppReminder } from '@/lib/sent'
import { sendPushToAdmin } from '@/lib/push'
import type { Appointment } from '@/types'

const state = vi.hoisted(() => ({ db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({ createAdminClient: () => state.db }))
vi.mock('@/lib/sent', () => ({ sendWhatsAppReminder: vi.fn(async () => {}) }))
vi.mock('@/lib/push', () => ({ sendPushToAdmin: vi.fn(async () => {}) }))

interface Scenario {
  appointments?: Appointment[]
  /** Códigos de cancelación que ya tiene otra cita próxima. */
  takenCodes?: string[]
  /** Error de la base de datos al guardar la cita. */
  insertError?: { message: string; code?: string }
}

function database({ appointments = [], takenCodes = [], insertError }: Scenario = {}) {
  return fakeSupabase((op: Op): Result | undefined => {
    switch (op.table) {
      case 'barbershops':
        return { data: { id: SHOP_ID, name: 'Barbería Artist Studio', timezone: TIMEZONE } }
      case 'services':
        return { data: { id: SERVICE_ID, name: 'Corte', duration_minutes: 60 } }
      case 'barbers':
        return { data: { id: BARBER_ID, name: 'Andrés' } }
      case 'barber_working_hours':
        return { data: WORKING_HOURS }
      case 'barber_breaks':
        return { data: BREAKS.filter((b) => b.is_active) }
      case 'blocked_dates':
        return { data: [] }
      case 'customers':
        return op.action === 'insert' ? { data: { id: 'cliente-1' } } : { data: null }
      case 'appointments':
        if (op.action === 'insert') {
          return insertError ? { error: insertError } : { data: { id: 'cita-nueva', ...op.values } }
        }
        if ('cancellation_code' in op.filters) {
          return { data: takenCodes.includes(op.filters.cancellation_code as string) ? [{ id: 'otra' }] : [] }
        }
        return { data: appointments }
    }
  })
}

function book(startTime: string, overrides: Record<string, unknown> = {}) {
  return POST(
    new NextRequest('http://localhost/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barbershop_id: SHOP_ID,
        barber_id: BARBER_ID,
        service_id: SERVICE_ID,
        customer: { name: 'Juan Pérez', phone: '3001234567' },
        start_time: startTime,
        ...overrides,
      }),
    })
  )
}

const inserted = (db: ReturnType<typeof database>) =>
  db.calls.find((c) => c.table === 'appointments' && c.action === 'insert')

// Igual que en Vercel: el servidor corre en hora UTC
const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'UTC'
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(NOW)) // lunes 5 de octubre, 10:05 am en Colombia
})
afterAll(() => {
  vi.useRealTimers()
  process.env.TZ = originalTz
})
beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.restoreAllMocks())

describe('Agendar: lo que sí se puede', () => {
  it('agenda una hora libre y le genera su código de cancelación de 4 dígitos', async () => {
    const db = database()
    state.db = db.client

    const res = await book(bogota('2026-10-05', '14:30'))

    expect(res.status).toBe(201)
    expect(inserted(db)?.values).toMatchObject({
      barber_id: BARBER_ID,
      customer_id: 'cliente-1',
      start_time: bogota('2026-10-05', '14:30'),
      end_time: bogota('2026-10-05', '15:30'),
      status: 'sync_pending',
    })
    expect(inserted(db)?.values?.cancellation_code).toMatch(/^\d{4}$/)
  })

  it('el código no se repite con el de otra cita próxima', async () => {
    // Los dos primeros códigos que salen ya los tiene otra cita
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(234.5 / 9000) // 1234
      .mockReturnValueOnce(4678.5 / 9000) // 5678
      .mockReturnValueOnce(3000.5 / 9000) // 4000
    const db = database({ takenCodes: ['1234', '5678'] })
    state.db = db.client

    await book(bogota('2026-10-05', '14:30'))

    expect(inserted(db)?.values?.cancellation_code).toBe('4000')
  })

  it('el WhatsApp automático y el aviso a Andrés dicen la hora de Colombia', async () => {
    state.db = database().client

    await book(bogota('2026-10-05', '14:30'))

    expect(sendWhatsAppReminder).toHaveBeenCalledWith({
      phone: '3001234567',
      customerName: 'Juan Pérez',
      date: 'lunes 5 de octubre',
      time: '2:30 pm',
      barberName: 'Andrés',
    })
    expect(vi.mocked(sendPushToAdmin).mock.calls[0][0].body).toBe('Juan Pérez — Corte, 5 oct 2:30 pm')
  })
})

describe('Agendar: lo que no se puede', () => {
  it('no deja agendar una hora que ya tiene otra persona', async () => {
    const db = database({ appointments: [appointment('2026-10-05', '14:30', '15:30')] })
    state.db = db.client

    const res = await book(bogota('2026-10-05', '14:30'))

    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/ya no está disponible/)
    expect(inserted(db)).toBeUndefined()
  })

  it('no deja agendar encima de una cita que no cae en punto', async () => {
    const db = database({ appointments: [appointment('2026-10-05', '15:00', '16:00')] })
    state.db = db.client

    expect((await book(bogota('2026-10-05', '14:30'))).status).toBe(409)
    expect(inserted(db)).toBeUndefined()
  })

  it('si dos personas agendan la misma hora al mismo tiempo, la base de datos rechaza la segunda', async () => {
    // Las dos pasaron la revisión, pero la base de datos solo deja guardar una
    const db = database({
      insertError: { code: '23P01', message: 'conflicting key value violates exclusion constraint "no_overlap"' },
    })
    state.db = db.client

    const res = await book(bogota('2026-10-05', '14:30'))

    expect(res.status).toBe(409)
    expect((await res.json()).error).toMatch(/fue tomado/)
    expect(sendWhatsAppReminder).not.toHaveBeenCalled()
  })

  it('no deja agendar una hora que ya pasó', async () => {
    state.db = database().client
    expect((await book(bogota('2026-10-05', '09:30'))).status).toBe(409)
  })

  it('no deja agendar después del cierre', async () => {
    state.db = database().client
    expect((await book(bogota('2026-10-05', '20:30'))).status).toBe(409)
  })

  it('no deja agendar en la hora de almuerzo', async () => {
    state.db = database().client
    expect((await book(bogota('2026-10-05', '12:30'))).status).toBe(409)
  })

  it('no deja agendar el domingo', async () => {
    state.db = database().client
    expect((await book(bogota('2026-10-11', '10:30'))).status).toBe(409)
  })

  it('no deja agendar una hora que no está en la lista (ej. 2:45 pm)', async () => {
    state.db = database().client
    expect((await book(bogota('2026-10-05', '14:45'))).status).toBe(409)
  })

  it('no deja agendar con datos incompletos', async () => {
    const db = database()
    state.db = db.client

    const res = await book(bogota('2026-10-05', '14:30'), { customer: { name: 'Juan', phone: '123' } })

    expect(res.status).toBe(400)
    expect(db.calls).toEqual([])
  })
})
