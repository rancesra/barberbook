'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface DaySchedule {
  day_of_week: number
  is_active: boolean
  start_time: string
  end_time: string
  id?: string
}

export default function EditarHorariosPage() {
  const router = useRouter()
  const params = useParams()
  const barberId = params.id as string
  const [barberName, setBarberName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: i !== 0, start_time: '08:30', end_time: '19:30' }))
  )

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('barbers').select('name').eq('id', barberId).single(),
      supabase.from('barber_working_hours').select('*').eq('barber_id', barberId),
    ]).then(([barberRes, hoursRes]) => {
      setBarberName(barberRes.data?.name ?? '')
      if (hoursRes.data && hoursRes.data.length > 0) {
        setSchedule(DAYS.map((_, i) => {
          const existing = hoursRes.data.find((h: DaySchedule) => h.day_of_week === i)
          return existing
            ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time, end_time: existing.end_time, id: existing.id }
            : { day_of_week: i, is_active: false, start_time: '08:30', end_time: '19:30' }
        }))
      }
      setLoading(false)
    })
  }, [barberId])

  const updateDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    for (const day of schedule) {
      const payload = { barber_id: barberId, day_of_week: day.day_of_week, is_active: day.is_active, start_time: day.start_time, end_time: day.end_time }
      if (day.id) {
        await supabase.from('barber_working_hours').update({ is_active: day.is_active, start_time: day.start_time, end_time: day.end_time }).eq('id', day.id)
      } else {
        await supabase.from('barber_working_hours').insert(payload)
      }
    }
    router.push('/admin')
  }

  if (loading) return <div className="p-6 text-text-muted text-sm">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
        <h1 className="text-2xl font-bold text-text-primary">Mi horario</h1>
      </div>

      <div className="card divide-y divide-border">
        {schedule.map((day, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            {/* Toggle activo */}
            <div className="flex items-center gap-2 w-28 flex-shrink-0">
              <input
                type="checkbox"
                checked={day.is_active}
                onChange={e => updateDay(i, 'is_active', e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className={`text-sm font-medium ${day.is_active ? 'text-text-primary' : 'text-text-muted'}`}>
                {DAYS[i]}
              </span>
            </div>

            {/* Horas */}
            {day.is_active ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={day.start_time}
                  onChange={e => updateDay(i, 'start_time', e.target.value)}
                  className="input-field py-1.5 text-sm w-32"
                />
                <span className="text-text-muted text-sm">–</span>
                <input
                  type="time"
                  value={day.end_time}
                  onChange={e => updateDay(i, 'end_time', e.target.value)}
                  className="input-field py-1.5 text-sm w-32"
                />
              </div>
            ) : (
              <span className="text-text-muted text-sm">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={handleSave} loading={saving} fullWidth>Guardar horarios</Button>
      </div>
    </div>
  )
}
