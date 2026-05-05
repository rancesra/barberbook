import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()
  await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', id)
    .eq('status', 'sync_pending') // only update if not already confirmed
  return NextResponse.json({ ok: true })
}
