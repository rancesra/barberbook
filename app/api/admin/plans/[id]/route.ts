import { NextResponse } from 'next/server'
import { getAdminClient, jsonError, readJson, unauthorized } from '@/lib/admin-auth'
import { firstIssue, planSchema } from '@/lib/admin-validation'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const [{ data, error }, { count }] = await Promise.all([
    supabase.from('plans').select('*').eq('id', id).maybeSingle(),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('plan_id', id),
  ])
  if (error) return jsonError(`No se pudo cargar el plan: ${error.message}`, 500)
  if (!data) return jsonError('Plan no encontrado', 404)

  // `subscriptions` cuenta todas, también las vencidas: con cualquiera el plan ya no se puede borrar.
  return NextResponse.json({ plan: data, subscriptions: count ?? 0 })
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const body = await readJson(req)
  if (!body) return jsonError('Datos inválidos')

  const parsed = planSchema.safeParse(body)
  if (!parsed.success) return jsonError(firstIssue(parsed.error))

  const { data, error } = await supabase.from('plans').update(parsed.data).eq('id', id).select()

  if (error) return jsonError(`No se pudo guardar el plan: ${error.message}`, 500)
  if (!data?.length) return jsonError('Plan no encontrado', 404)

  return NextResponse.json({ plan: data[0] })
}

/**
 * Borra el plan. Si hay clientes que lo compraron, no se puede borrar (sus
 * suscripciones apuntan a él), así que se oculta de la página en su lugar.
 */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const { count, error: countError } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', id)

  if (countError) return jsonError(`No se pudo revisar el plan: ${countError.message}`, 500)

  if ((count ?? 0) > 0) {
    const { data, error } = await supabase
      .from('plans')
      .update({ is_active: false })
      .eq('id', id)
      .select('id')

    if (error) return jsonError(`No se pudo ocultar el plan: ${error.message}`, 500)
    if (!data?.length) return jsonError('Plan no encontrado', 404)

    return NextResponse.json({ archived: true })
  }

  const { data, error } = await supabase.from('plans').delete().eq('id', id).select('id')

  if (error) return jsonError(`No se pudo eliminar el plan: ${error.message}`, 500)
  if (!data?.length) return jsonError('Plan no encontrado', 404)

  return NextResponse.json({ deleted: true })
}
