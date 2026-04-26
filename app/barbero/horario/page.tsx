'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface DaySchedule {
  day_of_week: number
  is_active: boolean
  start_time: string
  end_time: string
  id?: string
}

export default function BarberHorarioPage() {
  const [barberId, setBarberId] = useState<string | null>(null)
  const [barberName, setBarberName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: i !== 0, start_time: '08:30', end_time: '19:30' }))
  )

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: barber } = await supabase
        .from('barbers')
        .select('id, name')
        .eq('auth_user_id', user.id)
        .single()

      if (!barber) return
      setBarberId(barber.id)
      setBarberName(barber.name)

      const { data: hours } = await supabase
        .from('barber_working_hours')
        .select('*')
        .eq('barber_id', barber.id)

      if (hours && hours.length > 0) {
        setSchedule(DAYS.map((_, i) => {
          const existing = hours.find((h: DaySchedule) => h.day_of_week === i)
          return existing
            ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time.slice(0, 5), end_time: existing.end_time.slice(0, 5), id: existing.id }
            : { day_of_week: i, is_active: false, start_time: '08:30', end_time: '19:30' }
        }))
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const handleSave = async () => {
    if (!barberId) return
    setSaving(true)
    setSaved(false)
    const supabase = createClient()

    for (const day of schedule) {
      const payload = {
        barber_id: barberId,
        day_of_week: day.day_of_week,
        is_active: day.is_active,
        start_time: day.start_time,
        end_time: day.end_time,
      }
      if (day.id) {
        await supabase.from('barber_working_hours')
          .update({ is_active: day.is_active, start_time: day.start_time, end_time: day.end_time })
          .eq('id', day.id)
      } else {
        await supabase.from('barber_working_hours').insert(payload)
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-text-muted text-xs uppercase tracking-wide">Mi horario</p>
        <h1 className="text-2xl font-bold text-text-primary">{barberName}</h1>
        <p className="text-text-secondary text-sm mt-0.5">Activa los días que trabajas y tu hora de entrada y salida</p>
      </div>

      <div className="card divide-y divide-border mb-4">
        {schedule.map((day, i) => (
          <div key={i} className="px-4 py-3.5">
            {/* Día + toggle */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${day.is_active ? 'text-text-primary' : 'text-text-muted'}`}>
                {DAYS[i]}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.is_active}
                  onChange={e => updateDay(i, 'is_active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-bg-tertiary rounded-full peer peer-checked:bg-gold transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Horas */}
            {day.is_active && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.start_time}
                  onChange={e => updateDay(i, 'start_time', e.target.value)}
                  className="input-field py-1.5 text-sm flex-1"
                />
                <span className="text-text-muted text-sm">–</span>
                <input
                  type="time"
                  value={day.end_time}
                  onChange={e => updateDay(i, 'end_time', e.target.value)}
                  className="input-field py-1.5 text-sm flex-1"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {saved && (
        <p className="text-green-400 text-sm text-center mb-3">✓ Horario guardado correctamente</p>
      )}

      <Button onClick={handleSave} loading={saving} fullWidth>
        Guardar horario
      </Button>
    </div>
  )
}
