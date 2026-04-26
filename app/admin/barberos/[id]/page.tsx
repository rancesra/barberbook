'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function EditarBarberoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', specialty: '', description: '', phone: '', photo_url: '', sort_order: 0, is_active: true,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('barbers').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({
        name: data.name ?? '',
        specialty: data.specialty ?? '',
        description: data.description ?? '',
        phone: data.phone ?? '',
        photo_url: data.photo_url ?? '',
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      })
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('barbers').update({
      name: form.name,
      specialty: form.specialty || null,
      description: form.description || null,
      phone: form.phone || null,
      photo_url: form.photo_url || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    }).eq('id', id)
    router.push('/admin/barberos')
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este barbero? Se eliminarán también sus horarios.')) return
    const supabase = createClient()
    await supabase.from('barbers').delete().eq('id', id)
    router.push('/admin/barberos')
  }

  if (loading) return <div className="p-6 text-text-muted text-sm">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/barberos" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar barbero</h1>
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
        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-gold" />
          <label htmlFor="is_active" className="text-sm text-text-secondary">Barbero activo</label>
        </div>
        <Button type="submit" loading={saving} fullWidth>Guardar cambios</Button>
      </form>
    </div>
  )
}
