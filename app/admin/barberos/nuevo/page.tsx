'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Camera, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

function convertToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/webp', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NuevoBarberoPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', specialty: '', description: '', phone: '', password: '', sort_order: 0,
  })

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const webp = await convertToWebP(file)
    setPhotoPreview(webp)
    setPhotoBase64(webp)
  }

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm(f => ({ ...f, phone: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.phone.length !== 10) {
      setError('El teléfono debe tener exactamente 10 dígitos')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setSaving(true)
    const res = await fetch('/api/admin/create-barber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photoBase64 }),
    })

    const result = await res.json()
    if (!res.ok || !result.success) {
      setError(result.error ?? 'Error al crear el barbero')
      setSaving(false)
      return
    }

    router.push('/admin/barberos')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/barberos" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
        <h1 className="text-2xl font-bold text-text-primary">Nuevo barbero</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Foto */}
        <div>
          <label className="label">Foto del barbero</label>
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-border hover:border-gold/50 transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-bg-secondary flex-shrink-0"
            >
              {photoPreview ? (
                <Image src={photoPreview} alt="preview" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <Camera size={28} className="text-text-muted" />
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-gold text-sm font-medium hover:text-gold-light transition-colors">
                {photoPreview ? 'Cambiar foto' : 'Subir foto'}
              </button>
              <p className="text-text-muted text-xs mt-1">JPG, PNG, HEIC — se convierte a WebP automáticamente</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="label">Nombre *</label>
          <input
            className="input-field"
            placeholder="Ej: Carlos"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        {/* Especialidad */}
        <div>
          <label className="label">Especialidad</label>
          <input
            className="input-field"
            placeholder="Ej: Degradados y barba"
            value={form.specialty}
            onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Ej: Especialista en cortes modernos..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="label">Teléfono / WhatsApp *</label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 flex-shrink-0">+57</span>
            <input
              type="tel"
              inputMode="numeric"
              className="input-field flex-1"
              placeholder="3156669991"
              value={form.phone}
              onChange={handlePhone}
              maxLength={10}
              required
            />
            <span className={`text-xs flex-shrink-0 ${form.phone.length === 10 ? 'text-green-400' : 'text-text-muted'}`}>
              {form.phone.length}/10
            </span>
          </div>
          <p className="text-text-muted text-xs mt-1">Este número será el usuario de acceso al panel del barbero</p>
        </div>

        {/* Contraseña */}
        <div>
          <label className="label">Contraseña de acceso *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-text-muted text-xs mt-1">El barbero usará su teléfono + esta contraseña para entrar</p>
        </div>

        {/* Orden */}
        <div>
          <label className="label">Orden de aparición</label>
          <input
            type="number"
            className="input-field"
            value={form.sort_order}
            onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <Button type="submit" loading={saving} fullWidth>
          Crear barbero y generar acceso
        </Button>
      </form>
    </div>
  )
}
