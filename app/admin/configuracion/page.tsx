'use client'
import { useState, useEffect } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Barbershop } from '@/types'

export default function ConfiguracionPage() {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('barbershops')
      .select('*')
      .single()
      .then(({ data }) => {
        setBarbershop(data)
        setLoading(false)
      })
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!barbershop) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('barbershops')
      .update({
        name: barbershop.name,
        description: barbershop.description,
        whatsapp: barbershop.whatsapp,
        instagram: barbershop.instagram,
        address: barbershop.address,
        google_maps_url: barbershop.google_maps_url,
      })
      .eq('id', barbershop.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateField = (key: keyof Barbershop, value: string) => {
    setBarbershop((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-secondary rounded w-1/3" />
          <div className="h-64 bg-bg-secondary rounded" />
        </div>
      </div>
    )
  }

  if (!barbershop) return null

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary text-sm mt-1">
          Personaliza la información de tu barbería
        </p>
      </div>

      {/* Link público */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs text-text-muted mb-0.5">Tu link público</p>
          <p className="text-text-primary text-sm font-medium">
            /barberia/{barbershop.slug}
          </p>
        </div>
        <a
          href={`/barberia/${barbershop.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gold text-sm hover:text-gold-light transition-colors"
        >
          <ExternalLink size={14} />
          Ver página
        </a>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div>
          <label className="label">Nombre de la barbería *</label>
          <input
            className="input-field"
            value={barbershop.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            value={barbershop.description ?? ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe tu barbería..."
          />
        </div>

        <div>
          <label className="label">WhatsApp</label>
          <input
            className="input-field"
            value={barbershop.whatsapp ?? ''}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            placeholder="+57 315 666 9991"
          />
        </div>

        <div>
          <label className="label">Instagram</label>
          <input
            className="input-field"
            value={barbershop.instagram ?? ''}
            onChange={(e) => updateField('instagram', e.target.value)}
            placeholder="@tu_barberia"
          />
        </div>

        <div>
          <label className="label">Dirección</label>
          <input
            className="input-field"
            value={barbershop.address ?? ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Calle Principal #123"
          />
        </div>

        <div>
          <label className="label">Link de Google Maps</label>
          <input
            className="input-field"
            value={barbershop.google_maps_url ?? ''}
            onChange={(e) => updateField('google_maps_url', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={saving} fullWidth>
            <Save size={16} className="mr-2" />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
