'use client'
import { useEffect, useState } from 'react'
import { format, isToday, isTomorrow, parseISO, startOfDay, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Check, Trash2, Clock, User, Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  customer: { name: string; phone: string } | null
  service: { name: string; duration_minutes: number; price?: number } | null
}

interface Barber {
  id: string
  name: string
}

function getDayLabel(dateStr: string) {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

function groupByDay(appointments: Appointment[]) {
  const groups: Record<string, Appointment[]> = {}
  appointments.forEach((a) => {
    const day = a.start_time.split('T')[0]
    if (!groups[day]) groups[day] = []
    groups[day].push(a)
  })
  return groups
}

export default function BarberDashboard() {
  const [barber, setBarber] = useState<Barber | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [earnedToday, setEarnedToday] = useState(0)
  const [earnedMonth, setEarnedMonth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Buscar el barbero vinculado a este usuario
    const { data: barberData } = await supabase
      .from('barbers')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single()

    if (!barberData) return
    setBarber(barberData)

    const now = new Date()
    const todayStart = startOfDay(now).toISOString()
    const monthStart = startOfMonth(now).toISOString()
    const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)

    // Citas próximas (desde hoy)
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, start_time, end_time, status, notes, customer:customers(name, phone), service:services(name, duration_minutes, price)')
      .eq('barber_id', barberData.id)
      .neq('status', 'cancelled')
      .gte('start_time', todayMidnight.toISOString())
      .order('start_time', { ascending: true })

    setAppointments((appts as unknown as Appointment[]) ?? [])

    // Ingresos: citas ya pasadas (start_time <= now) y no canceladas
    const [todayEarned, monthEarned] = await Promise.all([
      supabase
        .from('appointments')
        .select('service:services(price)')
        .eq('barber_id', barberData.id)
        .gte('start_time', todayStart)
        .lte('start_time', now.toISOString())
        .neq('status', 'cancelled'),
      supabase
        .from('appointments')
        .select('service:services(price)')
        .eq('barber_id', barberData.id)
        .gte('start_time', monthStart)
        .lte('start_time', now.toISOString())
        .neq('status', 'cancelled'),
    ])

    const sumPrices = (data: unknown[] | null): number =>
      (data ?? []).reduce((acc: number, row: unknown) => {
        const r = row as { service?: { price?: number } | null }
        return acc + (r.service?.price ?? 0)
      }, 0)

    setEarnedToday(sumPrices(todayEarned.data))
    setEarnedMonth(sumPrices(monthEarned.data))
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setActionLoading(id + status)
    await supabase.from('appointments').update({ status }).eq('id', id)
    await loadData()
    setActionLoading(null)
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    setActionLoading(id + 'delete')
    await supabase.from('appointments').delete().eq('id', id)
    await loadData()
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const groups = groupByDay(appointments)
  const days = Object.keys(groups).sort()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-text-muted text-xs uppercase tracking-wide">Bienvenido</p>
        <h1 className="text-2xl font-bold text-text-primary">{barber?.name}</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="card p-4">
          <p className="text-text-muted text-xs mb-1">Citas hoy</p>
          <p className="text-3xl font-bold text-gold">
            {appointments.filter(a => isToday(parseISO(a.start_time))).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-text-muted text-xs mb-1">Próximas</p>
          <p className="text-3xl font-bold text-text-primary">
            {appointments.filter(a => !isToday(parseISO(a.start_time))).length}
          </p>
        </div>
      </div>

      {/* Ingresos */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-text-muted text-xs mb-1">Ganado hoy</p>
          <p className="text-2xl font-bold text-green-400">{formatPrice(earnedToday)}</p>
        </div>
        <div className="card p-4">
          <p className="text-text-muted text-xs mb-1">Ganado este mes</p>
          <p className="text-2xl font-bold text-green-400">{formatPrice(earnedMonth)}</p>
        </div>
      </div>

      {/* Lista de citas */}
      {days.length === 0 ? (
        <div className="card p-10 text-center">
          <Calendar size={36} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No tienes citas próximas</p>
        </div>
      ) : (
        <div className="space-y-5">
          {days.map((day) => (
            <div key={day}>
              <h2 className="text-sm font-semibold text-gold uppercase tracking-wide mb-3 capitalize">
                {getDayLabel(day)}
              </h2>
              <div className="space-y-3">
                {groups[day].map((appt) => (
                  <div key={appt.id} className="card p-4">
                    {/* Hora y estado */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gold" />
                        <span className="text-gold font-bold text-sm">
                          {format(parseISO(appt.start_time), 'h:mm a')}
                        </span>
                      </div>
                      <Badge variant={appt.status} />
                    </div>

                    {/* Cliente y servicio */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-text-muted flex-shrink-0" />
                        <span className="text-text-primary text-sm font-medium">
                          {appt.customer?.name ?? '—'}
                        </span>
                        {appt.customer?.phone && (
                          <a
                            href={`https://wa.me/57${appt.customer.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-whatsapp ml-auto"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors size={13} className="text-text-muted flex-shrink-0" />
                        <span className="text-text-secondary text-sm">{appt.service?.name ?? '—'}</span>
                      </div>
                      {appt.notes && (
                        <p className="text-text-muted text-xs pl-5 italic">"{appt.notes}"</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'completed')}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-900/30 text-green-400 text-xs font-medium hover:bg-green-900/50 transition-colors disabled:opacity-50"
                        >
                          <Check size={14} />
                          Completar
                        </button>
                      )}
                      <button
                        onClick={() => deleteAppointment(appt.id)}
                        disabled={!!actionLoading}
                        className="p-2 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
