import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient, createClient } from '@/lib/supabase/server'

/**
 * Cliente con service role, solo si hay una sesión iniciada en el panel.
 *
 * El panel guarda por aquí y no directo desde el navegador porque las
 * políticas RLS de Supabase no dejan actualizar `barbershops` con la sesión
 * del navegador: el update no daba error, simplemente no cambiaba nada, y
 * el panel decía "¡Guardado!". Así se perdía el aviso.
 */
export async function getAdminClient(): Promise<SupabaseClient | null> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  return user ? createAdminClient() : null
}

export function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** La app tiene una sola barbería. */
export async function getBarbershopId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.from('barbershops').select('id').single()
  return data?.id ?? null
}

/** Lee el cuerpo JSON sin reventar si viene vacío o mal formado. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null)
  return body && typeof body === 'object' && !Array.isArray(body) ? body : null
}
