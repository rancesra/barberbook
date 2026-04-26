'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function NuevoBarberoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', specialty: '', description: '', phone: '', photo_url: '', sort_order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: barbershop } = await supabase.from('barbershops').select('id').single()
    await supabase.from('barbers').insert({
      barbershop_id: barbershop?.id,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      specialty: form.specialty || null,
      description: form.description || null,
      phone: form.phone || null,
      photo_url: form.photo_url || null,
      sort_order: form.sort_order,
      is_active: true,
    })
    router.push('/admin/barberos')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/barberos" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo barbero</h1>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Nombre *</label>
          <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Especialidad</label>
          <input className="input-field" placeholder="Ej: Degradados y barba" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input-field" placeholder="+57 300 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="label">URL de foto</label>
          <input className="input-field" placeholder="/barbers/nombre.jpg" value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} />
        </div>
        <div>
          <label className="label">Orden</label>
          <input type="number" className="input-field" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) }))} />
        </div>
        <Button type="submit" loading={saving} fullWidth>Crear barbero</Button>
      </form>
    </div>
  )
}
