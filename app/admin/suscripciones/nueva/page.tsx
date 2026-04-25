'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  cuts_per_month: number
}

export default function NuevaSuscripcionPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    plan_id: '',
    starts_at: new Date().toISOString().split('T')[0],
    expires_at: '',
    notes: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setPlans(data ?? [])
      if (data && data[0]) {
        const exp = new Date()
        exp.setMonth(exp.getMonth() + 1)
        setForm(f => ({
          ...f,
          plan_id: data[0].id,
          expires_at: exp.toISOString().split('T')[0],
        }))
      }
    })
  }, [])

  const selectedPlan = plans.find(p => p.id === form.plan_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return
    setSaving(true)

    const supabase = createClient()
    const { data: barbershop } = await supabase.from('barbershops').select('id').single()

    await supabase.from('subscriptions').insert({
      barbershop_id: barbershop?.id,
      plan_id: form.plan_id,
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone || null,
      cuts_used: 0,
      cuts_total: selectedPlan.cuts_per_month >= 99 ? 999 : selectedPlan.cuts_per_month,
      status: 'active',
      starts_at: form.starts_at,
      expires_at: form.expires_at,
      notes: form.notes || null,
    })

    router.push('/admin/suscripciones')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/suscripciones" className="text-text-muted hover:text-text-secondary text-sm">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Nueva suscripción</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Plan *</label>
          <select
            className="input-field"
            value={form.plan_id}
            onChange={e => setForm(f => ({ ...f, plan_id: e.target.value }))}
            required
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — ${p.price.toLocaleString('es-CO')}/mes — {p.cuts_per_month >= 99 ? 'Ilimitados' : `${p.cuts_per_month} cortes`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Nombre del cliente *</label>
          <input
            className="input-field"
            value={form.customer_name}
            onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Correo electrónico *</label>
          <input
            type="email"
            className="input-field"
            value={form.customer_email}
            onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="label">Teléfono</label>
          <input
            className="input-field"
            value={form.customer_phone}
            onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
            placeholder="+57 300 000 0000"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Fecha inicio *</label>
            <input
              type="date"
              className="input-field"
              value={form.starts_at}
              onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Fecha vencimiento *</label>
            <input
              type="date"
              className="input-field"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Nota interna</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Ej: Pagó por Nequi el 25 de abril..."
          />
        </div>

        <Button type="submit" loading={saving} fullWidth>
          Activar suscripción
        </Button>
      </form>
    </div>
  )
}
