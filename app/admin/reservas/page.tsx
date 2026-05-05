'use client'
import { useEffect, useState } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, MessageCircle, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppLink } from '@/lib/utils'
import Link from 'next/link'

interface Appointment {
  id: string
  start_time: string
  status: string
  notes: string | null
  service: { name: string; duration_minutes: number } | null
  customer: { name: string; phone: string } | null
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:    'Confirmada',
  cancelled:    'Cancelada',
  completed:    'Completada',
  no_show:      'No asistió',
  sync_pending: 'No confirmada',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:    'text-green-400 bg-green-900/30',
  cancelled:    'text-red-400 bg-red-900/20',
  completed:    'text-blue-400 bg-blue-900/20',
  no_show:      'text-yellow-400 bg-yellow-900/20',
  sync_pending: 'text-red-400 bg-red-900/20',
}

export default function ReservasPage() {
  const [barberId, setBarberId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    const supabase = createClient()
    let bid = barberId
    if (!bid) {
      const { data: barber } = await supabase
        .from('barbers').select('id').eq('is_active', true).order('sort_order').limit(1).single()
      if (!barber) { setLoading(false); return }
      bid = barber.id
      setBarberId(bid)
    }
    const { data } = await supabase
      .from('appointments')
      .select('id, start_time, status, notes, service:services(name, duration_minutes), customer:customers(name, phone)')
      .eq('barber_id', bid)
      .order('start_time', { ascending: false })
      .limit(500)
    setAppointments((data as unknown as Appointment[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('appointments').update({ status }).eq('id', id)
    await load()
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return
    const supabase = createClient()
    await supabase.from('appointments').delete().eq('id', id)
    await load()
  }

  let filtered = appointments
  if (tab === 'upcoming') filtered = appointments.filter(a => !isPast(parseISO(a.start_time)))
  if (tab === 'past')     filtered = appointments.filter(a => isPast(parseISO(a.start_time)))
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter)

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mis reservas</h1>
          <p className="text-text-secondary text-sm mt-1">{appointments.length} reservas en total</p>
        </div>
        <Link
          href="/agendar?from=admin"
          className="flex items-center gap-1.5 bg-gold text-bg-primary text-xs font-bold px-3 py-2 rounded-lg hover:bg-gold-light transition-colors"
        >
          <Plus size={14} />
          Nueva cita
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-bg-secondary p-1 rounded-xl w-fit">
        {([['upcoming','Próximas'],['past','Pasadas'],['all','Todas']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${tab === key ? 'bg-gold text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtros estado */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['all','confirmed','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === s ? 'bg-bg-tertiary text-text-primary border border-border-light' : 'text-text-muted hover:text-text-secondary'}`}>
            {s === 'all' ? 'Todos los estados' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((appt) => {
          const startDate = parseISO(appt.start_time)
          const past = isPast(startDate)
          const waMsg = `Hola ${appt.customer?.name}, te recordamos tu cita el ${format(startDate, "d 'de' MMMM", { locale: es })} a las ${format(startDate, 'h:mm a')}.`
          const waLink = appt.customer?.phone ? buildWhatsAppLink(appt.customer.phone, waMsg) : null

          return (
            <div key={appt.id} className={`card p-4 ${past ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-text-primary">{appt.customer?.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>📋 {appt.service?.name}</span>
                    <span>📅 {format(startDate, "d MMM yyyy", { locale: es })} · {format(startDate, 'h:mm a')}</span>
                    {appt.customer?.phone && (
                      <span className="flex items-center gap-1"><Phone size={10} />{appt.customer.phone}</span>
                    )}
                  </div>
                  {appt.notes && <p className="text-xs text-text-muted mt-1.5 italic">"{appt.notes}"</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg text-whatsapp hover:bg-green-900/20 transition-colors" title="WhatsApp">
                      <MessageCircle size={16} />
                    </a>
                  )}
                  {!past && appt.customer?.phone && (
                    <button
                      onClick={async () => {
                        if (appt.status === 'sync_pending') await updateStatus(appt.id, 'confirmed')
                        const startDate2 = parseISO(appt.start_time)
                        const msg = `Hola ${appt.customer?.name} 👋 te recordamos tu cita en *Artist Studio*:\n\n📅 ${format(startDate2, "d 'de' MMMM", { locale: es })} a las *${format(startDate2, 'h:mm a')}*\n✂️ ${appt.service?.name}\n\n¡Te esperamos!`
                        window.open(buildWhatsAppLink(appt.customer!.phone, msg), '_blank')
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-whatsapp hover:bg-green-900/20 transition-colors"
                      title="Recordar al cliente"
                    >
                      <MessageCircle size={16} />
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
            <p className="text-text-secondary">No hay reservas aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
