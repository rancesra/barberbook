import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { fakeSupabase, jsonRequest, params, type Op, type Result } from './helpers/fake-supabase'
import { planSchema } from '@/lib/admin-validation'
import { PlanCard, type PlanCardData } from '@/components/public/PlanCard'
import * as plansRoute from '@/app/api/admin/plans/route'
import * as planRoute from '@/app/api/admin/plans/[id]/route'

const session = vi.hoisted(() => ({ user: null as { id: string } | null, db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: session.user } }) } }),
  createAdminClient: () => session.db,
}))

const SHOP_ID = 'shop-1'

const validPlan = {
  name: 'Premium',
  subtitle: 'El más popular',
  price: '180000',
  cuts_per_month: 4,
  benefits: ['4 cortes al mes', 'Arreglo de cejas incluido'],
  is_popular: true,
  badge_text: 'Especial',
  color: '#A855F7',
  is_active: true,
}

beforeEach(() => {
  session.user = { id: 'andres' }
})

describe('Planes: lo que se puede guardar', () => {
  it('quita los beneficios vacíos y los espacios sobrantes', () => {
    const plan = planSchema.parse({ ...validPlan, benefits: ['  4 cortes ', '', '   ', 'Bebida'] })
    expect(plan.benefits).toEqual(['4 cortes', 'Bebida'])
  })

  it('convierte el precio escrito a número', () => {
    expect(planSchema.parse(validPlan).price).toBe(180000)
  })

  it('no acepta precio en 0', () => {
    const result = planSchema.safeParse({ ...validPlan, price: '0' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Pon un precio mayor a 0')
  })

  it('exige nombre', () => {
    const result = planSchema.safeParse({ ...validPlan, name: '   ' })
    expect(result.error?.issues[0].message).toBe('El plan necesita un nombre')
  })

  it('99 cortes = ilimitados; más que eso no', () => {
    expect(planSchema.safeParse({ ...validPlan, cuts_per_month: 99 }).success).toBe(true)
    expect(planSchema.safeParse({ ...validPlan, cuts_per_month: 120 }).success).toBe(false)
  })

  it('etiqueta vacía se guarda como null (sale "Más popular")', () => {
    expect(planSchema.parse({ ...validPlan, badge_text: '' }).badge_text).toBeNull()
  })

  it('no acepta colores inválidos', () => {
    expect(planSchema.safeParse({ ...validPlan, color: 'morado' }).success).toBe(false)
  })
})

describe('Planes: crear, editar, ordenar y eliminar', () => {
  it('sin sesión no deja crear planes', async () => {
    session.user = null
    session.db = fakeSupabase(() => undefined).client

    const res = await plansRoute.POST(jsonRequest('POST', validPlan))

    expect(res.status).toBe(401)
  })

  it('crea el plan al final de la lista', async () => {
    const db = fakeSupabase((op: Op): Result | undefined => {
      if (op.table === 'barbershops') return { data: { id: SHOP_ID } }
      if (op.action === 'select') return { data: [{ sort_order: 3 }] }
      if (op.action === 'insert') return { data: [{ id: 'nuevo', ...op.values }] }
    })
    session.db = db.client

    const res = await plansRoute.POST(jsonRequest('POST', validPlan))

    expect(res.status).toBe(201)
    expect(db.calls.find((c) => c.action === 'insert')?.values).toMatchObject({
      name: 'Premium',
      price: 180000,
      badge_text: 'Especial',
      barbershop_id: SHOP_ID,
      sort_order: 4,
    })
  })

  it('lista los planes ocultos también y cuenta solo clientes activos', async () => {
    session.db = fakeSupabase((op: Op): Result | undefined => {
      if (op.table === 'barbershops') return { data: { id: SHOP_ID } }
      if (op.table === 'plans') {
        return { data: [{ id: 'p1', is_active: true }, { id: 'p2', is_active: false }] }
      }
      if (op.table === 'subscriptions') {
        return {
          data: [
            { plan_id: 'p1', status: 'active' },
            { plan_id: 'p1', status: 'active' },
            { plan_id: 'p1', status: 'cancelled' },
          ],
        }
      }
    }).client

    const res = await plansRoute.GET()
    const { plans } = await res.json()

    expect(plans).toEqual([
      { id: 'p1', is_active: true, subscribers: 2 },
      { id: 'p2', is_active: false, subscribers: 0 },
    ])
  })

  it('editar guarda los cambios', async () => {
    const db = fakeSupabase((op) => (op.action === 'update' ? { data: [{ id: 'p1' }] } : undefined))
    session.db = db.client

    const res = await planRoute.PATCH(jsonRequest('PATCH', { ...validPlan, price: 200000 }), params('p1'))

    expect(res.status).toBe(200)
    const update = db.calls.find((c) => c.action === 'update')
    expect(update?.filters).toEqual({ id: 'p1' })
    expect(update?.values).toMatchObject({ price: 200000 })
  })

  it('editar un plan que no existe responde 404', async () => {
    session.db = fakeSupabase((op) => (op.action === 'update' ? { data: [] } : undefined)).client

    const res = await planRoute.PATCH(jsonRequest('PATCH', validPlan), params('no-existe'))

    expect(res.status).toBe(404)
  })

  it('reordenar guarda el orden 1, 2, 3', async () => {
    const db = fakeSupabase((op) => (op.action === 'update' ? { data: [{ id: op.filters.id }] } : undefined))
    session.db = db.client
    const ids = [
      '8d2f5a4c-b51d-428f-b0d5-74ab106e9a26',
      'da5af6f8-6add-417a-884e-66e642c95c35',
      '46e6a346-00a3-41fb-82a0-af9e960507d6',
    ]

    const res = await plansRoute.PUT(jsonRequest('PUT', { order: ids }))

    expect(res.status).toBe(200)
    expect(db.calls.map((c) => [c.filters.id, c.values?.sort_order])).toEqual([
      [ids[0], 1],
      [ids[1], 2],
      [ids[2], 3],
    ])
  })

  it('eliminar un plan sin clientes lo borra', async () => {
    const db = fakeSupabase((op: Op): Result | undefined => {
      if (op.table === 'subscriptions') return { count: 0 }
      if (op.action === 'delete') return { data: [{ id: 'p1' }] }
    })
    session.db = db.client

    const res = await planRoute.DELETE(jsonRequest('DELETE'), params('p1'))

    expect(await res.json()).toEqual({ deleted: true })
    expect(db.calls.some((c) => c.action === 'delete')).toBe(true)
  })

  it('eliminar un plan que tiene clientes lo oculta en vez de borrarlo', async () => {
    const db = fakeSupabase((op: Op): Result | undefined => {
      if (op.table === 'subscriptions') return { count: 2 }
      if (op.action === 'update') return { data: [{ id: 'p1' }] }
    })
    session.db = db.client

    const res = await planRoute.DELETE(jsonRequest('DELETE'), params('p1'))

    expect(await res.json()).toEqual({ archived: true })
    expect(db.calls.find((c) => c.action === 'update')?.values).toEqual({ is_active: false })
    expect(db.calls.some((c) => c.action === 'delete')).toBe(false)
  })
})

describe('Planes: así se ven en la página', () => {
  const card: PlanCardData = {
    name: 'Premium',
    subtitle: 'El más popular',
    price: 180000,
    cuts_per_month: 4,
    benefits: ['4 cortes al mes', '', 'Bebida: café o agua'],
    is_popular: true,
    badge_text: 'Especial',
    color: '#A855F7',
  }

  it('el destacado muestra su etiqueta personalizada', () => {
    expect(renderToStaticMarkup(<PlanCard plan={card} />)).toContain('Especial')
  })

  it('sin etiqueta, el destacado dice "Más popular"', () => {
    expect(renderToStaticMarkup(<PlanCard plan={{ ...card, badge_text: null }} />)).toContain('Más popular')
  })

  it('un plan normal no lleva etiqueta', () => {
    const html = renderToStaticMarkup(<PlanCard plan={{ ...card, is_popular: false }} />)
    expect(html).not.toContain('Especial')
    expect(html).not.toContain('Más popular')
  })

  it('muestra precio con puntos de miles y los beneficios, sin líneas vacías', () => {
    const html = renderToStaticMarkup(<PlanCard plan={card} />)
    expect(html).toContain('180.000')
    expect(html).toContain('Bebida: café o agua')
    expect(html.match(/<li/g)).toHaveLength(2)
  })

  it('99 cortes se muestra como "Cortes ilimitados"', () => {
    expect(renderToStaticMarkup(<PlanCard plan={{ ...card, cuts_per_month: 99 }} />)).toContain('Cortes ilimitados')
  })
})
