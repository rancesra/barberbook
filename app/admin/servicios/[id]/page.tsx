'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function EditarServicioPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', description: '', duration_minutes: 30, price: 0, sort_order: 0, is_active: true,
  })

  useEffect(() => {
    createClient().from('services').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({
        name: data.name ?? '',
        description: data.description ?? '',
        duration_minutes: data.duration_minutes ?? 30,
        price: data.price ?? 0,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      })
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await createClient().from('services').update({
      name: form.name,
      description: form.description || null,
      duration_minutes: form.duration_minutes,
      price: form.price,
      sort_order: form.sort_order,
      is_active: form.is_active,
    }).eq('id', id)
    router.push('/admin/servicios')
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este servicio?')) return
    await createClient().from('services').delete().eq('id', id)
    router.push('/admin/servicios')
  }

  if (loading) return <div className="p-6 text-text-muted text-sm">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/servicios" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar servicio</h1>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
          <Trash2 size={16} /> Eliminar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Nombre *</label>
          <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
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
          <label className="label">Orden</label>
          <input type="number" className="input-field" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) }))} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-gold" />
          <label htmlFor="is_active" className="text-sm text-text-secondary">Servicio activo</label>
        </div>
        <Button type="submit" loading={saving} fullWidth>Guardar cambios</Button>
      </form>
    </div>
  )
}
