'use client'
import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, MessageCircle, Check, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppLink } from '@/lib/utils'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  barber: { name: string } | null
  service: { name: string; duration_minutes: number } | null
  customer: { name: string; phone: string; email: string | null } | null
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
  sync_pending: 'Pendiente',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-green-400 bg-green-900/30',
  cancelled: 'text-red-400 bg-red-900/20',
  completed: 'text-blue-400 bg-blue-900/20',
  no_show: 'text-yellow-400 bg-yellow-900/20',
  sync_pending: 'text-text-muted bg-bg-tertiary',
}

export default function ReservasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('appointments')
      .select('*, barber:barbers(name), service:services(name, duration_minutes), customer:customers(name, phone, email)')
      .order('start_time', { ascending: false })
      .limit(200)
    setAppointments(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return
    const supabase = createClient()
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reservas</h1>
          <p className="text-text-secondary text-sm mt-1">{appointments.length} reservas registradas</p>
        </div>
        {/* Filtro */}
        <div className="flex gap-2 flex-wrap">
          {['all','confirmed','completed','cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === s ? 'bg-gold text-bg-primary' : 'bg-bg-secondary text-text-secondary hover:text-text-primary'}`}
            >
              {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((appt) => {
          const startDate = parseISO(appt.start_time)
          const waMsg = `Hola ${appt.customer?.name}, te recordamos tu cita para el ${format(startDate, "d 'de' MMMM", { locale: es })} a las ${format(startDate, 'h:mm a')}.`
          const waLink = appt.customer?.phone ? buildWhatsAppLink(appt.customer.phone, waMsg) : null

          return (
            <div key={appt.id} className="card p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-text-primary">{appt.customer?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>✂️ {appt.barber?.name}</span>
                    <span>📋 {appt.service?.name}</span>
                    <span>📅 {format(startDate, "d MMM yyyy", { locale: es })} · {format(startDate, 'h:mm a')}</span>
                    {appt.customer?.phone && (
                      <span className="flex items-center gap-1"><Phone size={10} />{appt.customer.phone}</span>
                    )}
                  </div>
                  {appt.notes && <p className="text-xs text-text-muted mt-1.5 italic">"{appt.notes}"</p>}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-whatsapp hover:bg-green-900/20 transition-colors" title="WhatsApp">
                      <MessageCircle size={16} />
                    </a>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => updateStatus(appt.id, 'completed')}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-900/20 transition-colors" title="Marcar completada">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteAppointment(appt.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-text-secondary">No hay reservas {filter !== 'all' ? STATUS_LABELS[filter].toLowerCase() + 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
}
