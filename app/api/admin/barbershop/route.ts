import { NextResponse } from 'next/server'
import { getAdminClient, getBarbershopId, jsonError, readJson, unauthorized } from '@/lib/admin-auth'
import { announcementSchema, barbershopSettingsSchema, firstIssue } from '@/lib/admin-validation'

// Guarda el aviso de la página o los datos generales de la barbería.
export async function PATCH(req: Request) {
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const body = await readJson(req)
  if (!body) return jsonError('Datos inválidos')

  const schema = 'announcement_active' in body ? announcementSchema : barbershopSettingsSchema
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError(firstIssue(parsed.error))

  const barbershopId = await getBarbershopId(supabase)
  if (!barbershopId) return jsonError('Barbería no encontrada', 404)

  const { data, error } = await supabase
    .from('barbershops')
    .update(parsed.data)
    .eq('id', barbershopId)
    .select()

  if (error) return jsonError(`No se pudo guardar: ${error.message}`, 500)
  // Sin filas de vuelta = no se guardó nada. Antes esto pasaba en silencio.
  if (!data?.length) return jsonError('No se guardó ningún cambio. Intenta de nuevo.', 500)

  return NextResponse.json({ barbershop: data[0] })
}
