import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminClient, jsonError, readJson, unauthorized } from '@/lib/admin-auth'
import { firstIssue, serviceSchema } from '@/lib/admin-validation'

type Params = { params: Promise<{ id: string }> }

/** Todas las citas del servicio: pasadas, futuras y canceladas. */
async function countAppointments(supabase: SupabaseClient, serviceId: string) {
  return supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('service_id', serviceId)
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const [{ data, error }, { count }] = await Promise.all([
    supabase.from('services').select('*').eq('id', id).maybeSingle(),
    countAppointments(supabase, id),
  ])
  if (error) return jsonError(`No se pudo cargar el servicio: ${error.message}`, 500)
  if (!data) return jsonError('Servicio no encontrado', 404)

  return NextResponse.json({ service: data, appointments: count ?? 0 })
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const body = await readJson(req)
  if (!body) return jsonError('Datos inválidos')

  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) return jsonError(firstIssue(parsed.error))

  const { data, error } = await supabase.from('services').update(parsed.data).eq('id', id).select()

  if (error) return jsonError(`No se pudo guardar el servicio: ${error.message}`, 500)
  if (!data?.length) return jsonError('Servicio no encontrado', 404)

  return NextResponse.json({ service: data[0] })
}

/**
 * Un servicio con citas no se borra nunca: el historial y los ingresos
 * dependen de él. Se oculta de la página para que nadie más lo agende.
 * Solo se borra de verdad si nunca tuvo ninguna cita.
 */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const { count, error: countError } = await countAppointments(supabase, id)
  // Si no se pudo contar, no se arriesga el historial: no se borra nada
  if (countError || count === null) {
    return jsonError('No se pudo revisar el historial del servicio. No se borró nada.', 500)
  }

  if (count > 0) {
    const { data, error } = await supabase.from('services').update({ is_active: false }).eq('id', id).select('id')

    if (error) return jsonError(`No se pudo ocultar el servicio: ${error.message}`, 500)
    if (!data?.length) return jsonError('Servicio no encontrado', 404)

    return NextResponse.json({ archived: true, appointments: count })
  }

  const { data, error } = await supabase.from('services').delete().eq('id', id).select('id')

  if (error) return jsonError(`No se pudo eliminar el servicio: ${error.message}`, 500)
  if (!data?.length) return jsonError('Servicio no encontrado', 404)

  return NextResponse.json({ deleted: true })
}
