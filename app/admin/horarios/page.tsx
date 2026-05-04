import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HorariosPage() {
  const supabase = createAdminClient()
  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .single()

  if (barber) {
    redirect(`/admin/horarios/${barber.id}`)
  }

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <p className="text-text-secondary">No hay barbero configurado.</p>
    </div>
  )
}
