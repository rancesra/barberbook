'use client'
import { useState, useEffect } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { PushNotificationToggle } from '@/components/admin/PushNotificationToggle'
import type { Barbershop } from '@/types'

export default function ConfiguracionPage() {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)
  const [savedAnnouncement, setSavedAnnouncement] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [announcementError, setAnnouncementError] = useState<string | null>(null)

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

  // Guarda por el servidor y solo dice "¡Guardado!" si la base de datos lo
  // confirma. Antes se guardaba desde el navegador, Supabase lo rechazaba en
  // silencio y el panel igual decía "¡Guardado!".
  const saveToServer = async (fields: Partial<Barbershop>): Promise<string | null> => {
    const res = await fetch('/api/admin/barbershop', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (res.ok) return null
    const result = await res.json().catch(() => ({}))
    return result.error ?? 'No se pudo guardar. Intenta de nuevo.'
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!barbershop) return
    setSaving(true)
    setSaveError(null)

    const error = await saveToServer({
      name: barbershop.name,
      description: barbershop.description,
      whatsapp: barbershop.whatsapp,
      instagram: barbershop.instagram,
      address: barbershop.address,
      google_maps_url: barbershop.google_maps_url,
    })

    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateField = (key: keyof Barbershop, value: string | boolean) => {
    setBarbershop((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  const handleSaveAnnouncement = async () => {
    if (!barbershop) return
    setSavingAnnouncement(true)
    setAnnouncementError(null)

    const error = await saveToServer({
      announcement_text: barbershop.announcement_text,
      announcement_active: barbershop.announcement_active,
    })

    setSavingAnnouncement(false)
    if (error) {
      setAnnouncementError(error)
      return
    }
    setSavedAnnouncement(true)
    setTimeout(() => setSavedAnnouncement(false), 3000)
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
    <div className="p-6 max-w-2xl ios-push">
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

      {/* Aviso en la página principal */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Aviso en la página</h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Se muestra en grande arriba del botón &quot;Agendar ahora&quot;.
            </p>
          </div>
          <Switch
            checked={barbershop.announcement_active ?? false}
            onChange={(checked) => updateField('announcement_active', checked)}
            label="Mostrar aviso en la página"
          />
        </div>

        <textarea
          className="input-field resize-none mt-4"
          rows={3}
          value={barbershop.announcement_text ?? ''}
          onChange={(e) => updateField('announcement_text', e.target.value)}
          placeholder="Ej: Este fin de semana no estaré viernes ni sábado"
        />

        <p className="text-text-muted text-xs mt-1.5">
          {barbershop.announcement_active
            ? 'Al guardar, el aviso queda visible para tus clientes.'
            : 'El aviso está oculto. Actívalo con el interruptor.'}
        </p>

        {announcementError && (
          <p className="text-red-400 text-sm mt-3" role="alert">{announcementError}</p>
        )}

        <Button
          type="button"
          onClick={handleSaveAnnouncement}
          loading={savingAnnouncement}
          fullWidth
          className="mt-4"
        >
          <Save size={16} className="mr-2" />
          {savedAnnouncement ? '¡Guardado!' : 'Guardar aviso'}
        </Button>
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

        {saveError && (
          <p className="text-red-400 text-sm" role="alert">{saveError}</p>
        )}

        <div className="pt-2">
          <Button type="submit" loading={saving} fullWidth>
            <Save size={16} className="mr-2" />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </div>
      </form>

      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-text-primary mb-1">Notificaciones push</h2>
        <p className="text-text-secondary text-sm mb-4">
          Recibe una alerta en tu teléfono o computador cuando entre una cita nueva.
        </p>
        <PushNotificationToggle />
      </div>
    </div>
  )
}
