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

interface DayBreak {
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: i !== 0, start_time: '08:30', end_time: '19:30' }))
  )
  const [breaks, setBreaks] = useState<DayBreak[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: false, start_time: '13:00', end_time: '14:00' }))
  )

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('barber_working_hours').select('*').eq('barber_id', barberId),
      supabase.from('barber_breaks').select('*').eq('barber_id', barberId),
    ]).then(([hoursRes, breaksRes]) => {
      if (hoursRes.data && hoursRes.data.length > 0) {
        setSchedule(DAYS.map((_, i) => {
          const existing = hoursRes.data.find((h: DaySchedule) => h.day_of_week === i)
          return existing
            ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time, end_time: existing.end_time, id: existing.id }
            : { day_of_week: i, is_active: false, start_time: '08:30', end_time: '19:30' }
        }))
      }
      if (breaksRes.data) {
        setBreaks(DAYS.map((_, i) => {
          const existing = breaksRes.data.find((b: DayBreak) => b.day_of_week === i)
          return existing
            ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time, end_time: existing.end_time, id: existing.id }
            : { day_of_week: i, is_active: false, start_time: '13:00', end_time: '14:00' }
        }))
      }
      setLoading(false)
    })
  }, [barberId])

  const updateDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const updateBreak = (index: number, field: keyof DayBreak, value: string | boolean) => {
    setBreaks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    // Guardar horarios de trabajo
    for (const day of schedule) {
      const payload = { barber_id: barberId, day_of_week: day.day_of_week, is_active: day.is_active, start_time: day.start_time, end_time: day.end_time }
      if (day.id) {
        await supabase.from('barber_working_hours').update({ is_active: day.is_active, start_time: day.start_time, end_time: day.end_time }).eq('id', day.id)
      } else {
        await supabase.from('barber_working_hours').insert(payload)
      }
    }

    // Guardar breaks
    for (const brk of breaks) {
      const payload = { barber_id: barberId, day_of_week: brk.day_of_week, is_active: brk.is_active, start_time: brk.start_time, end_time: brk.end_time }
      if (brk.id) {
        await supabase.from('barber_breaks').update({ is_active: brk.is_active, start_time: brk.start_time, end_time: brk.end_time }).eq('id', brk.id)
      } else if (brk.is_active) {
        await supabase.from('barber_breaks').insert(payload)
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

      {/* Horario de trabajo */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Días y horario</h2>
      <div className="card divide-y divide-border mb-6">
        {schedule.map((day, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-center gap-4">
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
              {day.is_active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={day.start_time}
                    onChange={e => updateDay(i, 'start_time', e.target.value)}
                    className="input-field py-1.5 text-sm w-32" />
                  <span className="text-text-muted text-sm">–</span>
                  <input type="time" value={day.end_time}
                    onChange={e => updateDay(i, 'end_time', e.target.value)}
                    className="input-field py-1.5 text-sm w-32" />
                </div>
              ) : (
                <span className="text-text-muted text-sm">Cerrado</span>
              )}
            </div>

            {/* Break / almuerzo para este día */}
            {day.is_active && (
              <div className="mt-3 ml-[120px] flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={breaks[i]?.is_active ?? false}
                    onChange={e => updateBreak(i, 'is_active', e.target.checked)}
                    className="w-3.5 h-3.5 accent-gold"
                  />
                  <span className="text-xs text-text-muted">Descanso / almuerzo</span>
                </div>
                {breaks[i]?.is_active && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={breaks[i]?.start_time ?? '13:00'}
                      onChange={e => updateBreak(i, 'start_time', e.target.value)}
                      className="input-field py-1 text-xs w-28" />
                    <span className="text-text-muted text-xs">–</span>
                    <input type="time" value={breaks[i]?.end_time ?? '14:00'}
                      onChange={e => updateBreak(i, 'end_time', e.target.value)}
                      className="input-field py-1 text-xs w-28" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} loading={saving} fullWidth>Guardar horario</Button>
    </div>
  )
}
