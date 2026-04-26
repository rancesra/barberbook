'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function NuevoServicioPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', duration_minutes: 30, price: 0, sort_order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: barbershop } = await supabase.from('barbershops').select('id').single()
    await supabase.from('services').insert({
      barbershop_id: barbershop?.id,
      name: form.name,
      description: form.description || null,
      duration_minutes: form.duration_minutes,
      price: form.price,
      sort_order: form.sort_order,
      is_active: true,
    })
    router.push('/admin/servicios')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/servicios" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo servicio</h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Nombre *</label>
          <input className="input-field" placeholder="Ej: Corte clásico" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Duración (minutos) *</label>
            <input type="number" className="input-field" min={5} step={5} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) }))} required />
          </div>
          <div>
            <label className="label">Precio *</label>
            <input type="number" className="input-field" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) }))} required />
          </div>
        </div>
        <div>
          <label className="label">Orden de aparición</label>
          <input type="number" className="input-field" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) }))} />
        </div>
        <Button type="submit" loading={saving} fullWidth>Crear servicio</Button>
      </form>
    </div>
  )
}
