import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = SubscriptionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 })
  }

  const { endpoint, keys } = parsed.data
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('push_subscriptions')
    .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint' })

  if (error) {
    return NextResponse.json({ error: 'Error guardando suscripción' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
