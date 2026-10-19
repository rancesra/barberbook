import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeSupabase, jsonRequest, params, type Op, type Result } from './helpers/fake-supabase'
import { serviceSchema } from '@/lib/admin-validation'
import { deleteSheetFor } from '@/lib/service-delete'
import { DELETE, PATCH } from '@/app/api/admin/services/[id]/route'
import { GET as LIST } from '@/app/api/admin/services/route'

const session = vi.hoisted(() => ({ user: null as { id: string } | null, db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: session.user } }) } }),
  createAdminClient: () => session.db,
}))

const CORTE = 'ff54de7c-96bc-4aa3-a819-3345ee8478d8'

/** Base de datos donde el servicio tiene `citas` citas (o falla al contarlas). */
function database(citas: number | 'falla') {
  return fakeSupabase((op: Op): Result | undefined => {
    if (op.table === 'appointments') {
      return citas === 'falla' ? { error: { message: 'timeout' }, count: null } : { count: citas }
    }
    if (op.table === 'services' && (op.action === 'update' || op.action === 'delete')) {
      return { data: [{ id: op.filters.id }] }
    }
  })
}

const corte = {
  name: 'Corte',
  description: null,
  duration_minutes: 60,
  price: 33000,
  sort_order: 1,
  is_active: true,
}

beforeEach(() => {
  session.user = { id: 'andres' }
})

describe('Borrar un servicio sin perder historial', () => {
  it('un servicio con citas NO se borra: se oculta', async () => {
    const db = database(609)
    session.db = db.client

    const res = await DELETE(jsonRequest('DELETE'), params(CORTE))

    expect(await res.json()).toEqual({ archived: true, appointments: 609 })
    expect(db.calls.some((c) => c.table === 'services' && c.action === 'delete')).toBe(false)
    const update = db.calls.find((c) => c.table === 'services' && c.action === 'update')
    expect(update?.values).toEqual({ is_active: false })
    expect(update?.filters).toEqual({ id: CORTE })
  })

  it('cuenta TODAS sus citas: pasadas, futuras y canceladas (sin filtro de fecha ni estado)', async () => {
    const db = database(1)
    session.db = db.client

    await DELETE(jsonRequest('DELETE'), params(CORTE))

    const count = db.calls.find((c) => c.table === 'appointments')
    expect(count?.filters).toEqual({ service_id: CORTE })
    expect(count?.head).toBe(true)
  })

  it('con una sola cita vieja ya no se borra', async () => {
    const db = database(1)
    session.db = db.client

    expect(await (await DELETE(jsonRequest('DELETE'), params(CORTE))).json()).toMatchObject({ archived: true })
    expect(db.calls.some((c) => c.action === 'delete')).toBe(false)
  })

  it('un servicio que nunca tuvo citas sí se borra', async () => {
    const db = database(0)
    session.db = db.client

    const res = await DELETE(jsonRequest('DELETE'), params(CORTE))

    expect(await res.json()).toEqual({ deleted: true })
    expect(db.calls.find((c) => c.action === 'delete')?.filters).toEqual({ id: CORTE })
  })

  it('si no se pueden contar las citas, no borra nada (por si acaso)', async () => {
    const db = database('falla')
    session.db = db.client

    const res = await DELETE(jsonRequest('DELETE'), params(CORTE))

    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/no se borró nada/i)
    expect(db.calls.some((c) => c.table === 'services')).toBe(false)
  })

  it('sin sesión no deja borrar', async () => {
    session.user = null
    session.db = database(0).client

    expect((await DELETE(jsonRequest('DELETE'), params(CORTE))).status).toBe(401)
  })
})

describe('La hoja explica qué va a pasar', () => {
  it('con citas: dice que se oculta y que el historial queda', () => {
    const sheet = deleteSheetFor({ name: 'Corte', appointments: 609 })
    expect(sheet.title).toBe('¿Ocultar "Corte"?')
    expect(sheet.message).toMatch(/609 citas/)
    expect(sheet.message).toMatch(/quedan intactos/)
    expect(sheet.confirmLabel).toBe('Ocultar servicio')
  })

  it('sin citas: dice que se borra para siempre', () => {
    const sheet = deleteSheetFor({ name: 'Mascarilla', appointments: 0 })
    expect(sheet.title).toBe('¿Eliminar "Mascarilla"?')
    expect(sheet.message).toMatch(/para siempre/)
  })
})

describe('Editar y listar servicios', () => {
  it('se puede volver a mostrar un servicio oculto', async () => {
    const db = database(609)
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { ...corte, is_active: true }), params(CORTE))

    expect(res.status).toBe(200)
    expect(db.calls.find((c) => c.action === 'update')?.values).toMatchObject({ is_active: true })
  })

  it('no acepta duración vacía ni precio negativo', () => {
    expect(serviceSchema.safeParse({ ...corte, duration_minutes: NaN }).error?.issues[0].message).toBe(
      'La duración debe ser un número'
    )
    expect(serviceSchema.safeParse({ ...corte, price: -1 }).error?.issues[0].message).toBe(
      'El precio no puede ser negativo'
    )
  })

  it('la lista trae también los ocultos, con sus citas', async () => {
    session.db = fakeSupabase((op: Op): Result | undefined => {
      if (op.table === 'barbershops') return { data: { id: 'shop' } }
      if (op.table === 'services') {
        return { data: [{ id: 'a', name: 'Corte', is_active: true }, { id: 'b', name: 'Barba', is_active: false }] }
      }
      if (op.table === 'appointments') return { count: op.filters.service_id === 'a' ? 609 : 25 }
    }).client

    const { services } = await (await LIST()).json()

    expect(services).toEqual([
      { id: 'a', name: 'Corte', is_active: true, appointments: 609 },
      { id: 'b', name: 'Barba', is_active: false, appointments: 25 },
    ])
  })
})
