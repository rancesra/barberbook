'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { useConfirm } from '@/components/ui/ConfirmSheet'
import { deleteSheetFor } from '@/lib/service-delete'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function EditarServicioPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { confirm, sheet } = useConfirm()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState(0)
  const [form, setForm] = useState({
    name: '', description: '', duration_minutes: 30, price: 0, sort_order: 0, is_active: true,
  })

  // Por el servidor: así también abre los servicios ocultos
  useEffect(() => {
    fetch(`/api/admin/services/${id}`)
      .then(async (res) => {
        const result = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(result.error ?? 'No se pudo cargar el servicio')
          return
        }
        const data = result.service
        setForm({
          name: data.name ?? '',
          description: data.description ?? '',
          duration_minutes: data.duration_minutes ?? 30,
          price: Number(data.price ?? 0),
          sort_order: data.sort_order ?? 0,
          is_active: data.is_active ?? true,
        })
        setAppointments(result.appointments ?? 0)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const res = await fetch(`/api/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const result = await res.json().catch(() => ({}))
      setError(result.error ?? 'No se pudo guardar. Intenta de nuevo.')
      setSaving(false)
      return
    }
    router.push('/admin/servicios')
  }

  const handleDelete = () => {
    confirm(deleteSheetFor({ name: form.name, appointments }), async () => {
      setError(null)
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const result = await res.json().catch(() => ({}))
        setError(result.error ?? 'No se pudo eliminar el servicio.')
        return
      }
      router.push('/admin/servicios')
    })
  }

  if (loading) return <div className="p-6 text-text-muted text-sm">Cargando...</div>

  const canDelete = form.is_active || appointments === 0

  return (
    <div className="p-6 max-w-2xl ios-push">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/servicios" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar servicio</h1>
        </div>
        {canDelete && (
          <button onClick={handleDelete} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <Trash2 size={16} /> {appointments > 0 ? 'Ocultar' : 'Eliminar'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-2xl p-3" role="alert">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
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
        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <p className="text-text-primary font-medium">Mostrar en la página</p>
            <p className="text-text-secondary text-sm mt-0.5">
              {form.is_active ? 'Tus clientes lo pueden agendar.' : 'Oculto: nadie lo puede agendar, pero sus citas siguen en el historial.'}
            </p>
          </div>
          <Switch checked={form.is_active} onChange={(v) => setForm(f => ({ ...f, is_active: v }))} label="Mostrar en la página" />
        </div>
        <Button type="submit" loading={saving} fullWidth>Guardar cambios</Button>
      </form>

      {sheet}
    </div>
  )
}
