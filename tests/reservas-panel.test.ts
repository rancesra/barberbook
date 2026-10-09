import { describe, expect, it } from 'vitest'
import { fakeSupabase, type Op } from './helpers/fake-supabase'
import { fetchAppointmentsPage, PAGE_SIZE, type PageRequest } from '@/lib/appointments-page'
import type { SupabaseClient } from '@supabase/supabase-js'

const NOW = new Date('2026-10-09T23:00:00.000Z')

function database(total: number) {
  const db = fakeSupabase((op: Op) => {
    const [from, to] = op.range ?? [0, total - 1]
    const items = Array.from({ length: Math.max(0, Math.min(to, total - 1) - from + 1) }, (_, i) => ({
      id: `cita-${from + i}`,
    }))
    return { data: items, count: total }
  })
  return { ...db, client: db.client as unknown as SupabaseClient }
}

const request = (overrides: Partial<PageRequest> = {}): PageRequest => ({
  barberId: 'andres',
  tab: 'past',
  status: 'all',
  offset: 0,
  now: NOW,
  ...overrides,
})

describe('Reservas del panel: de a poco, no las 500 de una', () => {
  it(`trae ${PAGE_SIZE} citas por página, no todas`, async () => {
    const db = database(934)

    const page = await fetchAppointmentsPage(db.client, request())

    expect(page.items).toHaveLength(PAGE_SIZE)
    expect(db.calls[0].range).toEqual([0, PAGE_SIZE - 1])
  })

  it('da el total real (934), no el tope de 500', async () => {
    const db = database(934)

    const page = await fetchAppointmentsPage(db.client, request({ tab: 'all' }))

    expect(page.total).toBe(934)
    expect(db.calls[0].count).toBe('exact')
  })

  it('"Cargar más" pide las siguientes, hasta llegar a las más viejas', async () => {
    const db = database(934)

    await fetchAppointmentsPage(db.client, request({ offset: 30 }))
    const last = await fetchAppointmentsPage(db.client, request({ offset: 930 }))

    expect(db.calls[0].range).toEqual([30, 59])
    expect(last.items.map((a) => (a as { id: string }).id)).toEqual(['cita-930', 'cita-931', 'cita-932', 'cita-933'])
  })

  it('Pasadas: solo las que ya pasaron, de la más reciente hacia atrás', async () => {
    const db = database(924)

    await fetchAppointmentsPage(db.client, request({ tab: 'past' }))

    expect(db.calls[0].filters).toEqual({ barber_id: 'andres', 'start_time <': NOW.toISOString() })
    expect(db.calls[0].order).toEqual({ column: 'start_time', ascending: false })
  })

  it('Próximas: solo las que vienen, de la más cercana a la más lejana', async () => {
    const db = database(10)

    await fetchAppointmentsPage(db.client, request({ tab: 'upcoming' }))

    expect(db.calls[0].filters).toEqual({ barber_id: 'andres', 'start_time >=': NOW.toISOString() })
    expect(db.calls[0].order).toEqual({ column: 'start_time', ascending: true })
  })

  it('Todas: sin filtro de fecha', async () => {
    const db = database(934)

    await fetchAppointmentsPage(db.client, request({ tab: 'all' }))

    expect(db.calls[0].filters).toEqual({ barber_id: 'andres' })
  })

  it('el filtro de estado lo hace la base de datos, así busca en todas las citas', async () => {
    const db = database(11)

    await fetchAppointmentsPage(db.client, request({ tab: 'all', status: 'cancelled' }))

    expect(db.calls[0].filters).toEqual({ barber_id: 'andres', status: 'cancelled' })
  })

  it('si la base de datos falla, avisa en vez de mostrar la lista vacía como si no hubiera citas', async () => {
    const db = fakeSupabase(() => ({ error: { message: 'timeout' } }))

    const page = await fetchAppointmentsPage(db.client as unknown as SupabaseClient, request())

    expect(page.error).toMatch(/no se pudieron cargar/i)
  })
})
