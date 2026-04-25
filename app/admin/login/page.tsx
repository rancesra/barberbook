'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mb-4">
            <Scissors size={28} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">BarberBook Admin</h1>
          <p className="text-text-secondary text-sm mt-1">Accede a tu panel de gestión</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="label">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@barberia.com"
              required
              autoComplete="email"
            />
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
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          Panel de administración exclusivo para dueños de barberías
        </p>
      </div>
    </div>
  )
}
