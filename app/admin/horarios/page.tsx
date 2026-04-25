import { createAdminClient } from '@/lib/supabase/server'
import type { Barber, BarberWorkingHours } from '@/types'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default async function HorariosPage() {
  const supabase = createAdminClient()

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*, working_hours:barber_working_hours(*)')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Horarios</h1>
        <p className="text-text-secondary text-sm mt-1">
          Configuración de horarios por barbero
        </p>
      </div>

      <div className="space-y-6">
        {barbers?.map((barber) => {
          const wh: BarberWorkingHours[] = (barber as unknown as Barber & { working_hours: BarberWorkingHours[] }).working_hours ?? []

          return (
            <div key={barber.id} className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-text-primary">{barber.name}</h2>
                <a
                  href={`/admin/horarios/${barber.id}`}
                  className="text-gold text-sm font-medium hover:text-gold-light"
                >
                  Editar →
                </a>
              </div>

              <div className="divide-y divide-border">
                {DAYS.map((dayName, dayIndex) => {
                  const schedule = wh.find((h) => h.day_of_week === dayIndex)
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
          )
        })}
      </div>
    </div>
  )
}
