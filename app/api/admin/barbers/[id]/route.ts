import { NextResponse } from 'next/server'
import { getAdminClient, jsonError, readJson, unauthorized } from '@/lib/admin-auth'
import { barberUpdateSchema, firstIssue } from '@/lib/admin-validation'
import { uploadBarberPhoto } from '@/lib/barber-photo'

type Params = { params: Promise<{ id: string }> }

// Guarda los datos del barbero y, si viene, su foto nueva.
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const body = await readJson(req)
  if (!body) return jsonError('Datos inválidos')

  const parsed = barberUpdateSchema.safeParse(body)
  if (!parsed.success) return jsonError(firstIssue(parsed.error))

  const { photoBase64, ...fields } = parsed.data
  const update: Record<string, unknown> = fields

  if (photoBase64) {
    const upload = await uploadBarberPhoto(supabase, photoBase64, id)
    if ('error' in upload) return jsonError(upload.error, 400)
    update.photo_url = upload.url
  }

  const { data, error } = await supabase.from('barbers').update(update).eq('id', id).select()

  if (error) return jsonError(`No se pudo guardar: ${error.message}`, 500)
  if (!data?.length) return jsonError('Barbero no encontrado', 404)

  return NextResponse.json({ barber: data[0] })
}
