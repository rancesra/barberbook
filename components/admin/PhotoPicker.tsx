'use client'
import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { resizePhoto } from '@/lib/image'

interface PhotoPickerProps {
  currentUrl?: string | null
  onChange: (dataUrl: string) => void
  onError?: (message: string) => void
}

/** Foto del barbero: tocarla abre la galería o la cámara del celular. */
export function PhotoPicker({ currentUrl, onChange, onError }: PhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const shown = preview ?? currentUrl

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir la misma foto
    if (!file) return

    setBusy(true)
    try {
      const dataUrl = await resizePhoto(file)
      setPreview(dataUrl)
      onChange(dataUrl)
    } catch {
      onError?.('No se pudo leer la foto. Prueba con otra.')
    } finally {
      setBusy(false)
    }
  }

  const pick = () => fileRef.current?.click()

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={pick}
        aria-label={shown ? 'Cambiar foto' : 'Subir foto'}
        className="glass relative w-24 h-24 rounded-3xl flex-shrink-0 flex items-center justify-center ios-press"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="w-full h-full object-cover rounded-3xl" />
        ) : (
          <Camera size={28} className="text-text-muted" />
        )}

        {busy && (
          <span className="absolute inset-0 rounded-3xl bg-black/55 flex items-center justify-center">
            <Loader2 size={22} className="text-white animate-spin" />
          </span>
        )}

        {shown && !busy && (
          <span className="glass-gold absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center">
            <Camera size={15} className="text-bg-primary" />
          </span>
        )}
      </button>

      <div>
        <button
          type="button"
          onClick={pick}
          className="text-gold text-sm font-semibold hover:text-gold-light transition-colors"
        >
          {shown ? 'Cambiar foto' : 'Subir foto'}
        </button>
        <p className="text-text-muted text-xs mt-1">
          {preview ? 'Se guarda al tocar "Guardar cambios"' : 'Desde la galería o la cámara'}
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
