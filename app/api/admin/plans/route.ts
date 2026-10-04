import { NextResponse } from 'next/server'
import { getAdminClient, getBarbershopId, jsonError, readJson, unauthorized } from '@/lib/admin-auth'
import { firstIssue, planOrderSchema, planSchema } from '@/lib/admin-validation'

// Todos los planes, también los ocultos, con cuántos clientes tiene cada uno.
export async function GET() {
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const barbershopId = await getBarbershopId(supabase)
  if (!barbershopId) return jsonError('Barbería no encontrada', 404)

  const [{ data: plans, error }, { data: subscriptions }] = await Promise.all([
    supabase.from('plans').select('*').eq('barbershop_id', barbershopId).order('sort_order'),
    supabase.from('subscriptions').select('plan_id, status').eq('barbershop_id', barbershopId),
  ])

  if (error) return jsonError(`No se pudieron cargar los planes: ${error.message}`, 500)

  const activeByPlan = new Map<string, number>()
  for (const sub of subscriptions ?? []) {
    if (sub.status === 'active') {
      activeByPlan.set(sub.plan_id, (activeByPlan.get(sub.plan_id) ?? 0) + 1)
    }
  }

  return NextResponse.json({
    plans: (plans ?? []).map((plan) => ({ ...plan, subscribers: activeByPlan.get(plan.id) ?? 0 })),
  })
}

// Crea un plan nuevo al final de la lista.
export async function POST(req: Request) {
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const body = await readJson(req)
  if (!body) return jsonError('Datos inválidos')

  const parsed = planSchema.safeParse(body)
  if (!parsed.success) return jsonError(firstIssue(parsed.error))

  const barbershopId = await getBarbershopId(supabase)
  if (!barbershopId) return jsonError('Barbería no encontrada', 404)

  const { data: last } = await supabase
    .from('plans')
    .select('sort_order')
    .eq('barbershop_id', barbershopId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const { data, error } = await supabase
    .from('plans')
    .insert({ ...parsed.data, barbershop_id: barbershopId, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
    .select()

  if (error) return jsonError(`No se pudo crear el plan: ${error.message}`, 500)
  if (!data?.length) return jsonError('No se creó el plan. Intenta de nuevo.', 500)

  return NextResponse.json({ plan: data[0] }, { status: 201 })
}

// Guarda el orden en que se muestran los planes.
export async function PUT(req: Request) {
  const supabase = await getAdminClient()
  if (!supabase) return unauthorized()

  const parsed = planOrderSchema.safeParse(await readJson(req))
  if (!parsed.success) return jsonError('Orden inválido')

  const results = await Promise.all(
    parsed.data.order.map((id, index) =>
      supabase.from('plans').update({ sort_order: index + 1 }).eq('id', id).select('id')
    )
  )

  const failed = results.find((r) => r.error || !r.data?.length)
  if (failed) return jsonError('No se pudo guardar el orden. Intenta de nuevo.', 500)

  return NextResponse.json({ success: true })
}
