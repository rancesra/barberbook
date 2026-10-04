import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { fakeSupabase, jsonRequest, type Op, type Result } from './helpers/fake-supabase'
import { announcementSchema } from '@/lib/admin-validation'
import type { Barbershop } from '@/types'
import { PATCH } from '@/app/api/admin/barbershop/route'
import { HeroSection } from '@/components/public/HeroSection'

const session = vi.hoisted(() => ({ user: null as { id: string } | null, db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: session.user } }) } }),
  createAdminClient: () => session.db,
}))

// El botón "Agendar ahora" usa el router de Next, que aquí no existe
vi.mock('@/components/ui/SheetLink', () => ({
  SheetLink: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

const SHOP_ID = 'shop-1'

/** Base de datos donde el update guarda bien (o no, según `saves`). */
function database({ saves = true } = {}) {
  return fakeSupabase((op: Op): Result | undefined => {
    if (op.table !== 'barbershops') return
    if (op.action === 'select') return { data: { id: SHOP_ID } }
    if (op.action === 'update') return { data: saves ? [{ id: SHOP_ID, ...op.values }] : [] }
  })
}

beforeEach(() => {
  session.user = { id: 'andres' }
})

describe('Aviso: guardar desde el panel', () => {
  it('sin sesión iniciada no deja cambiar el aviso', async () => {
    session.user = null
    session.db = database().client

    const res = await PATCH(jsonRequest('PATCH', { announcement_text: 'Hola', announcement_active: true }))

    expect(res.status).toBe(401)
  })

  it('guarda el texto y lo deja activo', async () => {
    const db = database()
    session.db = db.client

    const res = await PATCH(
      jsonRequest('PATCH', { announcement_text: '  Cerrado el 6 de octubre  ', announcement_active: true })
    )

    expect(res.status).toBe(200)
    const update = db.calls.find((c) => c.action === 'update')
    expect(update?.filters).toEqual({ id: SHOP_ID })
    expect(update?.values).toEqual({ announcement_text: 'Cerrado el 6 de octubre', announcement_active: true })
  })

  it('si la base de datos no guarda nada, responde error en vez de "¡Guardado!" (el fallo que tenía)', async () => {
    session.db = database({ saves: false }).client

    const res = await PATCH(jsonRequest('PATCH', { announcement_text: 'Hola', announcement_active: true }))

    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/no se guardó/i)
  })

  it('no deja activar un aviso vacío', async () => {
    const db = database()
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { announcement_text: '   ', announcement_active: true }))

    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Escribe el texto del aviso antes de activarlo')
    expect(db.calls.some((c) => c.action === 'update')).toBe(false)
  })

  it('apagado y sin texto se guarda como null', () => {
    const parsed = announcementSchema.parse({ announcement_text: '  ', announcement_active: false })
    expect(parsed).toEqual({ announcement_text: null, announcement_active: false })
  })

  it('también guarda los datos generales de la barbería (mismo problema)', async () => {
    const db = database()
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { name: 'Barbería Artist Studio', whatsapp: '+573156669991' }))

    expect(res.status).toBe(200)
    expect(db.calls.find((c) => c.action === 'update')?.values).toMatchObject({
      name: 'Barbería Artist Studio',
      whatsapp: '+573156669991',
      instagram: null,
    })
  })
})

describe('Aviso: se ve en la página principal', () => {
  // Las pruebas usan React 18, que no conoce fetchPriority; la página usa el
  // React que trae Next, que sí. Se calla solo esa advertencia.
  beforeAll(() => {
    const original = console.error
    vi.spyOn(console, 'error').mockImplementation((message, ...rest) => {
      if (!String(rest[0] ?? message).includes('fetchPriority')) original(message, ...rest)
    })
  })
  afterAll(() => vi.restoreAllMocks())

  const shop = (overrides: Partial<Barbershop>) =>
    ({ name: 'Barbería Artist Studio', whatsapp: null, address: null, ...overrides }) as Barbershop

  it('se muestra cuando está activo', () => {
    const html = renderToStaticMarkup(
      <HeroSection barbershop={shop({ announcement_active: true, announcement_text: 'Día sin carro y moto: 6 de octubre' })} />
    )
    expect(html).toContain('AVISO')
    expect(html).toContain('Día sin carro y moto: 6 de octubre')
  })

  it('no se muestra cuando está apagado', () => {
    const html = renderToStaticMarkup(
      <HeroSection barbershop={shop({ announcement_active: false, announcement_text: 'Texto guardado pero apagado' })} />
    )
    expect(html).not.toContain('AVISO')
    expect(html).not.toContain('Texto guardado pero apagado')
  })
})
