'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

const DEFAULT_BREAK_START = '12:30'
const DEFAULT_BREAK_END = '13:30'

export default function EditarHorariosPage() {
  const router = useRouter()
  const params = useParams()
  const barberId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: i !== 0, start_time: '08:30', end_time: '19:30' }))
  )
  const [breaks, setBreaks] = useState<DayBreak[]>(
    DAYS.map((_, i) => ({ day_of_week: i, is_active: false, start_time: DEFAULT_BREAK_START, end_time: DEFAULT_BREAK_END }))
  )

  useEffect(() => {
    fetch(`/api/schedule?barberId=${barberId}`)
      .then((r) => r.json())
      .then(({ hours, breaks: breaksData }) => {
        if (hours && hours.length > 0) {
          setSchedule(DAYS.map((_, i) => {
            const existing = hours.find((h: DaySchedule) => h.day_of_week === i)
            return existing
              ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time, end_time: existing.end_time, id: existing.id }
              : { day_of_week: i, is_active: false, start_time: '08:30', end_time: '19:30' }
          }))
        }
        if (breaksData) {
          setBreaks(DAYS.map((_, i) => {
            const existing = breaksData.find((b: DayBreak) => b.day_of_week === i)
            return existing
              ? { day_of_week: i, is_active: existing.is_active, start_time: existing.start_time, end_time: existing.end_time, id: existing.id }
              : { day_of_week: i, is_active: false, start_time: DEFAULT_BREAK_START, end_time: DEFAULT_BREAK_END }
          }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [barberId])

  const updateDay = (index: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
  }

  const updateBreak = (index: number, field: keyof DayBreak, value: string | boolean) => {
    setBreaks(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId, schedule, breaks }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? 'Error al guardar')
        setSaving(false)
        return
      }
      router.push('/admin')
    } catch {
      setSaveError('Error de conexión')
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-text-muted text-sm">Cargando...</div>

  return (
    <div className="p-4 sm:p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-text-muted hover:text-text-secondary text-sm">← Volver</Link>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Mi horario</h1>
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm">
          {saveError}
        </div>
      )}

      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Días y horario</h2>
      <div className="card divide-y divide-border mb-6">
        {schedule.map((day, i) => (
          <div key={i} className="px-4 py-3">

            {/* Fila principal: checkbox + nombre + horas */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* Checkbox + nombre */}
              <label className="flex items-center gap-2 min-w-[110px]">
                <input
                  type="checkbox"
                  checked={day.is_active}
                  onChange={e => updateDay(i, 'is_active', e.target.checked)}
                  className="w-4 h-4 accent-gold flex-shrink-0"
                />
                <span className={`text-sm font-medium ${day.is_active ? 'text-text-primary' : 'text-text-muted'}`}>
                  {DAYS[i]}
                </span>
              </label>

              {/* Horas o "Cerrado" */}
              {day.is_active ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={e => updateDay(i, 'start_time', e.target.value)}
                    className="input-field py-1.5 text-sm w-28"
                  />
                  <span className="text-text-muted text-sm">–</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={e => updateDay(i, 'end_time', e.target.value)}
                    className="input-field py-1.5 text-sm w-28"
                  />
                </div>
              ) : (
                <span className="text-text-muted text-sm">Cerrado</span>
              )}
            </div>

            {/* Break / almuerzo — solo si el día está activo */}
            {day.is_active && (
              <div className="mt-2 pl-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breaks[i]?.is_active ?? false}
                    onChange={e => updateBreak(i, 'is_active', e.target.checked)}
                    className="w-3.5 h-3.5 accent-gold flex-shrink-0"
                  />
                  <span className="text-xs text-text-muted">Descanso / almuerzo</span>
                </label>

                {breaks[i]?.is_active && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <input
                      type="time"
                      value={breaks[i]?.start_time ?? DEFAULT_BREAK_START}
                      onChange={e => updateBreak(i, 'start_time', e.target.value)}
                      className="input-field py-1 text-xs w-24"
                    />
                    <span className="text-text-muted text-xs">–</span>
                    <input
                      type="time"
                      value={breaks[i]?.end_time ?? DEFAULT_BREAK_END}
                      onChange={e => updateBreak(i, 'end_time', e.target.value)}
                      className="input-field py-1 text-xs w-24"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} loading={saving} fullWidth>
        Guardar horario
      </Button>
    </div>
  )
}
