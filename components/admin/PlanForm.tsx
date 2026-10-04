'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { useConfirm } from '@/components/ui/ConfirmSheet'
import { DEFAULT_BADGE, PlanCard } from '@/components/public/PlanCard'

const COLORS = [
  { value: '#C9A84C', name: 'Dorado' },
  { value: '#EAB308', name: 'Amarillo' },
  { value: '#A855F7', name: 'Morado' },
  { value: '#3B82F6', name: 'Azul' },
  { value: '#22C55E', name: 'Verde' },
  { value: '#EF4444', name: 'Rojo' },
  { value: '#EC4899', name: 'Rosado' },
  { value: '#9CA3AF', name: 'Gris' },
]

const BADGE_SUGGESTIONS = [DEFAULT_BADGE, 'Especial', 'Recomendado', 'Nuevo', 'Oferta']

const UNLIMITED = 99
const BACK = '/admin/suscripciones?tab=planes'

interface FormState {
  name: string
  subtitle: string
  price: string // solo dígitos
  cuts: string
  unlimited: boolean
  benefits: string[]
  is_popular: boolean
  badge_text: string
  color: string
  is_active: boolean
}

const EMPTY: FormState = {
  name: '',
  subtitle: '',
  price: '',
  cuts: '4',
  unlimited: false,
  benefits: [''],
  is_popular: false,
  badge_text: '',
  color: COLORS[0].value,
  is_active: true,
}

interface PlanFormProps {
  /** Sin id: plan nuevo. */
  planId?: string
}

export function PlanForm({ planId }: PlanFormProps) {
  const router = useRouter()
  const { confirm, sheet } = useConfirm()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [subscriptions, setSubscriptions] = useState(0)
  const [loading, setLoading] = useState(!!planId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const benefitRefs = useRef<(HTMLInputElement | null)[]>([])
  const focusBenefit = useRef<number | null>(null)

  useEffect(() => {
    if (!planId) return
    fetch(`/api/admin/plans/${planId}`)
      .then(async (res) => {
        const result = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(result.error ?? 'No se pudo cargar el plan')
          return
        }
        const plan = result.plan
        setForm({
          name: plan.name,
          subtitle: plan.subtitle ?? '',
          price: String(Math.round(Number(plan.price))),
          cuts: plan.cuts_per_month >= UNLIMITED ? '4' : String(plan.cuts_per_month),
          unlimited: plan.cuts_per_month >= UNLIMITED,
          benefits: plan.benefits.length ? plan.benefits : [''],
          is_popular: plan.is_popular,
          badge_text: plan.badge_text ?? '',
          color: plan.color,
          is_active: plan.is_active,
        })
        setSubscriptions(result.subscriptions ?? 0)
      })
      .finally(() => setLoading(false))
  }, [planId])

  // Al agregar un beneficio, el cursor salta al campo nuevo
  useEffect(() => {
    if (focusBenefit.current === null) return
    benefitRefs.current[focusBenefit.current]?.focus()
    focusBenefit.current = null
  }, [form.benefits.length])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setBenefit = (index: number, value: string) =>
    setForm((f) => ({ ...f, benefits: f.benefits.map((b, i) => (i === index ? value : b)) }))

  const addBenefit = () => {
    focusBenefit.current = form.benefits.length
    setForm((f) => ({ ...f, benefits: [...f.benefits, ''] }))
  }

  const removeBenefit = (index: number) =>
    setForm((f) => {
      const benefits = f.benefits.filter((_, i) => i !== index)
      return { ...f, benefits: benefits.length ? benefits : [''] }
    })

  const cutsPerMonth = form.unlimited ? UNLIMITED : Number(form.cuts) || 0

  const preview = {
    name: form.name,
    subtitle: form.subtitle || null,
    price: Number(form.price) || 0,
    cuts_per_month: cutsPerMonth,
    benefits: form.benefits,
    is_popular: form.is_popular,
    badge_text: form.badge_text || null,
    color: form.color,
  }

  const previewBlock = (
    <>
      <p className="text-xs font-semibold tracking-[0.12em] text-text-muted mb-5">ASÍ SE VE EN LA PÁGINA</p>
      <div className={form.is_active ? '' : 'opacity-50'}>
        <PlanCard plan={preview} />
      </div>
    </>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch(planId ? `/api/admin/plans/${planId}` : '/api/admin/plans', {
      method: planId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...preview,
        price: form.price,
        cuts_per_month: cutsPerMonth,
        is_active: form.is_active,
      }),
    })

    if (!res.ok) {
      const result = await res.json().catch(() => ({}))
      setError(result.error ?? 'No se pudo guardar el plan. Intenta de nuevo.')
      setSaving(false)
      return
    }

    router.push(BACK)
  }

  const handleDelete = () => {
    const inUse = subscriptions > 0
    confirm(
      {
        title: inUse ? `¿Ocultar el plan ${form.name}?` : `¿Eliminar el plan ${form.name}?`,
        message: inUse
          ? `Hay ${subscriptions} suscripción${subscriptions === 1 ? '' : 'es'} con este plan, así que no se puede borrar. Se quita de la página y las suscripciones siguen igual.`
          : 'Se quita de la página principal. Esto no se puede deshacer.',
        confirmLabel: inUse ? 'Ocultar plan' : 'Eliminar plan',
        destructive: true,
      },
      async () => {
        setError(null)
        const res = await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE' })
        if (!res.ok) {
          const result = await res.json().catch(() => ({}))
          setError(result.error ?? 'No se pudo eliminar el plan.')
          return
        }
        router.push(BACK)
      }
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-2xl w-1/3" />
          <div className="h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl ios-push">
      <div className="flex items-center gap-3 mb-6">
        <Link href={BACK} className="text-text-muted hover:text-text-secondary text-sm">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">{planId ? 'Editar plan' : 'Nuevo plan'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lo básico */}
          <div className="card p-6 space-y-4">
            <div>
              <label className="label" htmlFor="plan-name">Nombre del plan *</label>
              <input
                id="plan-name"
                className="input-field"
                placeholder="Ej: Premium"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={60}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="plan-subtitle">Frase corta</label>
              <input
                id="plan-subtitle"
                className="input-field"
                placeholder="Ej: El más popular"
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="label" htmlFor="plan-price">Precio al mes *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  id="plan-price"
                  className="input-field pl-8"
                  inputMode="numeric"
                  placeholder="180.000"
                  value={form.price ? Number(form.price).toLocaleString('es-CO') : ''}
                  onChange={(e) => set('price', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="plan-cuts">Cortes al mes *</label>
              <div className="flex items-center gap-4">
                <input
                  id="plan-cuts"
                  type="number"
                  min={1}
                  max={98}
                  className="input-field flex-1 disabled:opacity-40"
                  value={form.unlimited ? '' : form.cuts}
                  placeholder={form.unlimited ? 'Ilimitados' : ''}
                  onChange={(e) => set('cuts', e.target.value)}
                  disabled={form.unlimited}
                  required={!form.unlimited}
                />
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className="text-sm text-text-secondary">Ilimitados</span>
                  <Switch checked={form.unlimited} onChange={(v) => set('unlimited', v)} label="Cortes ilimitados" />
                </div>
              </div>
            </div>
          </div>

          {/* Qué incluye */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text-primary">Qué incluye</h2>
            <p className="text-text-secondary text-sm mt-0.5 mb-4">Cada línea sale con un check en la tarjeta.</p>

            <div className="space-y-2">
              {form.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    ref={(el) => { benefitRefs.current[i] = el }}
                    className="input-field flex-1"
                    placeholder={i === 0 ? 'Ej: 4 cortes al mes' : 'Otro beneficio'}
                    value={benefit}
                    onChange={(e) => setBenefit(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addBenefit()
                      }
                    }}
                    maxLength={120}
                    aria-label={`Beneficio ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(i)}
                    aria-label={`Quitar beneficio ${i + 1}`}
                    className="w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addBenefit}
              className="mt-3 inline-flex items-center gap-1.5 text-gold text-sm font-semibold hover:text-gold-light transition-colors"
            >
              <Plus size={16} />
              Agregar beneficio
            </button>
          </div>

          {/* Apariencia */}
          <div className="card p-6 space-y-5">
            <div>
              <p className="label">Color</p>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Color del plan">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={form.color.toLowerCase() === c.value.toLowerCase()}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => set('color', c.value)}
                    className={`w-9 h-9 rounded-full transition-transform ios-press ${
                      form.color.toLowerCase() === c.value.toLowerCase()
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-primary scale-110'
                        : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-text-primary font-medium">Destacar este plan</p>
                <p className="text-text-secondary text-sm mt-0.5">Sale resaltado en dorado, con una etiqueta arriba.</p>
              </div>
              <Switch checked={form.is_popular} onChange={(v) => set('is_popular', v)} label="Destacar este plan" />
            </div>

            {form.is_popular && (
              <div className="ios-reveal">
                <label className="label" htmlFor="plan-badge">Etiqueta</label>
                <input
                  id="plan-badge"
                  className="input-field"
                  placeholder={DEFAULT_BADGE}
                  value={form.badge_text}
                  onChange={(e) => set('badge_text', e.target.value)}
                  maxLength={30}
                />
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {BADGE_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('badge_text', s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                        (form.badge_text || DEFAULT_BADGE) === s
                          ? 'bg-gold/15 border-gold/40 text-gold'
                          : 'border-white/15 text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-text-primary font-medium">Mostrar en la página</p>
                <p className="text-text-secondary text-sm mt-0.5">
                  {form.is_active ? 'Tus clientes lo ven.' : 'Oculto: tus clientes no lo ven.'}
                </p>
              </div>
              <Switch checked={form.is_active} onChange={(v) => set('is_active', v)} label="Mostrar en la página" />
            </div>
          </div>

          {/* En el celular la vista previa va aquí, antes de guardar */}
          <div className="lg:hidden pt-2 pb-2">{previewBlock}</div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-2xl p-3" role="alert">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" loading={saving} fullWidth>
            <Save size={16} className="mr-2" />
            {planId ? 'Guardar cambios' : 'Crear plan'}
          </Button>

          {planId && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={15} />
              {subscriptions > 0 ? 'Ocultar plan' : 'Eliminar plan'}
            </button>
          )}
        </form>

        <aside className="hidden lg:block lg:sticky lg:top-6">{previewBlock}</aside>
      </div>

      {sheet}
    </div>
  )
}
