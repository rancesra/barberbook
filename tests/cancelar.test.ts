import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { fakeSupabase, type Op, type Result } from './helpers/fake-supabase'
import { bogota, NOW } from './helpers/agenda'
import { POST } from '@/app/api/appointments/cancel/route'
import { sendPushToAdmin } from '@/lib/push'

const state = vi.hoisted(() => ({ db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({ createAdminClient: () => state.db }))
vi.mock('@/lib/push', () => ({ sendPushToAdmin: vi.fn(async () => {}) }))

const CITA = {
  id: 'cita-de-juan',
  start_time: bogota('2026-10-06', '15:00'),
  status: 'confirmed',
  service: { name: 'Corte + Barba' },
  customer: { name: 'Juan Pérez', phone: '3001234567' },
}

/** Base de datos donde solo la cita de Juan tiene el código 4821. */
function database() {
  return fakeSupabase((op: Op): Result | undefined => {
    if (op.table !== 'appointments') return
    if (op.action === 'select') return { data: op.filters.cancellation_code === '4821' ? CITA : null }
    if (op.action === 'update') return { error: null }
  })
}

const cancel = (code: unknown) =>
  POST(
    new NextRequest('http://localhost/api/appointments/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
  )

const originalTz = process.env.TZ
beforeAll(() => {
  process.env.TZ = 'UTC' // como en Vercel
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(NOW))
})
afterAll(() => {
  vi.useRealTimers()
  process.env.TZ = originalTz
})
beforeEach(() => vi.clearAllMocks())

describe('Cancelar con el código', () => {
  it('con el código correcto cancela esa cita y solo esa', async () => {
    const db = database()
    state.db = db.client

    const res = await cancel('4821')

    expect(res.status).toBe(200)
    const updates = db.calls.filter((c) => c.action === 'update')
    expect(updates).toHaveLength(1)
    expect(updates[0].values).toEqual({ status: 'cancelled' })
    expect(updates[0].filters).toEqual({ id: 'cita-de-juan' })
  })

  it('le confirma al cliente qué cita canceló, en hora de Colombia', async () => {
    state.db = database().client

    const { appointment } = await (await cancel('4821')).json()

    expect(appointment).toEqual({
      customerName: 'Juan Pérez',
      serviceName: 'Corte + Barba',
      date: 'martes 6 de octubre',
      time: '3:00 pm',
    })
  })

  it('solo busca citas que no han pasado y que siguen activas', async () => {
    const db = database()
    state.db = db.client

    await cancel('4821')

    expect(db.calls[0].filters).toEqual({
      cancellation_code: '4821',
      'status !=': 'cancelled',
      'start_time >=': NOW,
    })
  })

  it('un código que no es de nadie no cancela nada', async () => {
    const db = database()
    state.db = db.client

    const res = await cancel('1111')

    expect(res.status).toBe(404)
    expect(db.calls.some((c) => c.action === 'update')).toBe(false)
    expect(sendPushToAdmin).not.toHaveBeenCalled()
  })

  it.each(['12a4', '123', '12345', '', 4821])('rechaza el código %j sin buscar nada', async (code) => {
    const db = database()
    state.db = db.client

    const res = await cancel(code)

    expect(res.status).toBe(400)
    expect(db.calls).toEqual([])
  })

  it('le avisa a Andrés que el cliente canceló', async () => {
    state.db = database().client

    await cancel('4821')

    expect(sendPushToAdmin).toHaveBeenCalledWith({
      title: 'Cita cancelada por el cliente',
      body: 'Juan Pérez canceló su cita de martes 6 de octubre a las 3:00 pm.',
      url: '/admin/reservas',
    })
  })
})
