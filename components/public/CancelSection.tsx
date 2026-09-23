'use client'
import { useState } from 'react'
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CancelledAppointment {
  customerName: string
  serviceName: string
  date: string
  time: string
}

export function CancelSection() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState<CancelledAppointment | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 4) {
      setError('El código debe tener 4 dígitos.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.error ?? 'No pudimos cancelar la cita. Intenta de nuevo.')
        return
      }

      setCancelled(result.appointment)
      setCode('')
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="cancelar" className="px-4 py-12 sm:py-16 scroll-mt-20">
      <div className="max-w-md mx-auto">
        <div className="card p-6">
          {cancelled ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={30} className="text-green-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Cita cancelada</h2>
              <p className="text-text-secondary text-sm">
                Cancelamos la cita de <span className="text-text-primary font-medium">{cancelled.customerName}</span>{' '}
                del <span className="text-text-primary font-medium">{cancelled.date}</span> a las{' '}
                <span className="text-text-primary font-medium">{cancelled.time}</span>.
              </p>
              <p className="text-text-muted text-xs mt-3">
                El horario quedó disponible de nuevo. ¡Te esperamos pronto!
              </p>
              <button
                onClick={() => setCancelled(null)}
                className="text-gold text-sm font-medium mt-4 hover:text-gold-light transition-colors"
              >
                Cancelar otra cita
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={18} className="text-gold flex-shrink-0" />
                <h2 className="text-lg font-bold text-text-primary">¿Necesitas cancelar tu cita?</h2>
              </div>
              <p className="text-text-secondary text-sm mb-5">
                Ingresa el código de 4 dígitos que recibiste al agendar.
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                    setError(null)
                  }}
                  placeholder="0000"
                  aria-label="Código de cancelación"
                  className="input-field text-center text-3xl font-bold tracking-[0.4em] pl-[0.4em]"
                />

                {error && (
                  <div className="flex items-start gap-2 mt-3">
                    <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={code.length !== 4}
                  fullWidth
                  className="mt-4"
                >
                  Cancelar mi cita
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
