import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeSupabase, jsonRequest, params, type Op, type Result } from './helpers/fake-supabase'
import { MAX_PHOTO_BYTES, parsePhotoDataUrl } from '@/lib/admin-validation'
import { PATCH } from '@/app/api/admin/barbers/[id]/route'

const session = vi.hoisted(() => ({ user: null as { id: string } | null, db: null as unknown }))

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: session.user } }) } }),
  createAdminClient: () => session.db,
}))

const BARBER_ID = '1e24fa59-1662-40b7-acbf-a56583a1569f'
const photo = (type: string, bytes = 32) => `data:${type};base64,${Buffer.alloc(bytes, 1).toString('base64')}`

const andres = {
  name: 'Andrés',
  specialty: 'Corte clásico y fades',
  description: 'Especialista en fades y cortes modernos.',
  phone: '+573156669991',
  sort_order: 1,
  is_active: true,
}

function database() {
  return fakeSupabase((op: Op): Result | undefined => {
    if (op.action === 'update') return { data: [{ id: BARBER_ID, ...op.values }] }
  })
}

beforeEach(() => {
  session.user = { id: 'andres' }
})

describe('Foto del barbero: formatos', () => {
  it('acepta WebP', () => {
    expect(parsePhotoDataUrl(photo('image/webp'))).toMatchObject({ ok: true, extension: 'webp' })
  })

  it('acepta JPEG (lo que manda Safari en iPhone)', () => {
    expect(parsePhotoDataUrl(photo('image/jpeg'))).toMatchObject({ ok: true, extension: 'jpg', contentType: 'image/jpeg' })
  })

  it('rechaza GIF', () => {
    expect(parsePhotoDataUrl(photo('image/gif'))).toEqual({ ok: false, error: 'La foto debe ser JPG, PNG o WebP' })
  })

  it('rechaza texto que no es una foto', () => {
    expect(parsePhotoDataUrl('hola').ok).toBe(false)
  })

  it('rechaza fotos de más de 3 MB', () => {
    expect(parsePhotoDataUrl(photo('image/jpeg', MAX_PHOTO_BYTES + 1))).toEqual({
      ok: false,
      error: 'La foto pesa más de 3 MB',
    })
  })
})

describe('Foto del barbero: cambiarla desde el panel', () => {
  it('sin sesión no deja cambiarla', async () => {
    session.user = null
    session.db = database().client

    const res = await PATCH(jsonRequest('PATCH', { ...andres, photoBase64: photo('image/jpeg') }), params(BARBER_ID))

    expect(res.status).toBe(401)
  })

  it('sube la foto y guarda su URL pública en el barbero', async () => {
    const db = database()
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { ...andres, photoBase64: photo('image/jpeg') }), params(BARBER_ID))

    expect(res.status).toBe(200)
    expect(db.uploads).toHaveLength(1)
    expect(db.uploads[0]).toMatchObject({ bucket: 'barbers', contentType: 'image/jpeg' })
    expect(db.uploads[0].name).toMatch(/^1e24fa59-.*\.jpg$/)

    const update = db.calls.find((c) => c.action === 'update')
    expect(update?.filters).toEqual({ id: BARBER_ID })
    expect(update?.values?.photo_url).toBe(
      `https://demo.supabase.co/storage/v1/object/public/barbers/${db.uploads[0].name}`
    )
  })

  it('sin foto nueva guarda los datos y no toca la foto', async () => {
    const db = database()
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { ...andres, specialty: 'Fades' }), params(BARBER_ID))

    expect(res.status).toBe(200)
    expect(db.uploads).toHaveLength(0)
    const values = db.calls.find((c) => c.action === 'update')?.values
    expect(values).toMatchObject({ specialty: 'Fades' })
    expect(values).not.toHaveProperty('photo_url')
  })

  it('si el almacenamiento es privado avisa, en vez de guardar una foto que saldría rota', async () => {
    const db = database()
    db.bucket.public = false
    session.db = db.client

    const res = await PATCH(jsonRequest('PATCH', { ...andres, photoBase64: photo('image/jpeg') }), params(BARBER_ID))

    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/no es público/)
    expect(db.calls.some((c) => c.action === 'update')).toBe(false)
  })
})
