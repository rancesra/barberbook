'use client'
import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function BarberLoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const email = `${phone.replace(/\s/g, '')}@barberartist.app`
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Número o contraseña incorrectos.')
      setLoading(false)
      return
    }

    window.location.href = '/barbero'
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mb-4">
            <Scissors size={28} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Acceso Barberos</h1>
          <p className="text-text-secondary text-sm mt-1">Barbería Artist Studio</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="label">Número de teléfono</label>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 flex-shrink-0">+57</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field flex-1"
                placeholder="3156669991"
                required
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" loading={loading} fullWidth className="mt-2">
            Entrar
          </Button>
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          ¿Olvidaste tu contraseña? Contacta al administrador
        </p>
      </div>
    </div>
  )
}
