'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

interface WorkingHour {
  day_of_week: number
  is_active: boolean
  start_time: string
  end_time: string
}

interface Barber {
  id: string
  name: string
  working_hours: WorkingHour[]
}

export default function HorariosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient()
      .from('barbers')
      .select('id, name, working_hours:barber_working_hours(*)')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setBarbers((data as unknown as Barber[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        {[1,2].map(i => <div key={i} className="h-64 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Horarios</h1>
        <p className="text-text-secondary text-sm mt-1">Configuración de horarios por barbero</p>
      </div>

      <div className="space-y-6">
        {barbers.map((barber) => (
          <div key={barber.id} className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">{barber.name}</h2>
              <Link
                href={`/admin/horarios/${barber.id}`}
                className="text-gold text-sm font-medium hover:text-gold-light transition-colors"
              >
                Editar →
              </Link>
            </div>

            <div className="divide-y divide-border">
              {DAYS.map((dayName, dayIndex) => {
                const schedule = barber.working_hours?.find(h => h.day_of_week === dayIndex)
                return (
                  <div key={dayIndex} className="flex items-center px-5 py-3 gap-4">
                    <p className="text-text-secondary text-sm w-24 flex-shrink-0">{dayName}</p>
                    {schedule?.is_active ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <p className="text-text-primary text-sm">
                          {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                        <p className="text-text-muted text-sm">Cerrado</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {barbers.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-text-secondary">No hay barberos activos</p>
          </div>
        )}
      </div>
    </div>
  )
}
