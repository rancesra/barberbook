'use client'
import { useEffect, useRef, useState } from 'react'
import { format, parseISO, isPast, isSameDay, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Phone, MessageCircle, Trash2, Plus, KeyRound, Check } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SwipeableRow } from '@/components/ui/SwipeableRow'
import { useConfirm } from '@/components/ui/ConfirmSheet'
import { LargeTitle } from '@/components/ui/LargeTitle'
import { toZonedTime } from 'date-fns-tz'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppLink } from '@/lib/utils'
import { fetchAppointmentsPage, type ReservasTab } from '@/lib/appointments-page'
import Link from 'next/link'

const TZ = 'America/Bogota'

interface Appointment {
  id: string
  start_time: string
  status: string
  notes: string | null
  cancellation_code: string | null
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

function subtitleFor(tab: ReservasTab, total: number): string {
  const n = total === 1 ? 'reserva' : 'reservas'
  if (tab === 'upcoming') return `${total} ${n} ${total === 1 ? 'próxima' : 'próximas'}`
  if (tab === 'past') return `${total} ${n} ${total === 1 ? 'pasada' : 'pasadas'}`
  return `${total} ${n} en total`
}

export default function ReservasPage() {
  const [barberId, setBarberId] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<ReservasTab>('upcoming')
  const [statusFilter, setStatusFilter] = useState('all')
  const [mapsUrl, setMapsUrl] = useState<string | null>(null)
  const { confirm: confirmAction, sheet: confirmSheet } = useConfirm()
  // Si se cambia de pestaña mientras carga, la respuesta vieja se ignora
  const requestId = useRef(0)

  // Barbero y link de Maps: una sola vez
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('barbers').select('id').eq('is_active', true).order('sort_order').limit(1).single()
      .then(({ data }) => {
        if (data) setBarberId(data.id)
        else setLoading(false)
      })
    supabase.from('barbershops').select('google_maps_url').limit(1).single()
      .then(({ data }) => { if (data?.google_maps_url) setMapsUrl(data.google_maps_url) })
  }, [])

  const fetchPage = (offset: number) =>
    fetchAppointmentsPage<Appointment>(createClient(), {
      barberId: barberId!,
      tab,
      status: statusFilter,
      offset,
      now: new Date(),
    })

  // Primera página cada vez que cambia la pestaña o el filtro
  useEffect(() => {
    if (!barberId) return
    const id = ++requestId.current
    setLoading(true)
    fetchPage(0).then((page) => {
      if (id !== requestId.current) return
      setAppointments(page.items)
      setTotal(page.total)
      setError(page.error)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId, tab, statusFilter])

  const loadMore = async () => {
    const id = requestId.current
    setLoadingMore(true)
    const page = await fetchPage(appointments.length)
    setLoadingMore(false)
    if (id !== requestId.current) return
    if (page.error) {
      setError(page.error)
      return
    }
    // Sin repetidas: si entró una cita nueva, la lista se corre una posición
    setAppointments((prev) => [...prev, ...page.items.filter((a) => !prev.some((p) => p.id === a.id))])
    setTotal(page.total)
  }

  const removeFromList = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    setTotal((t) => Math.max(0, t - 1))
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await createClient().from('appointments').update({ status }).eq('id', id)
    if (error) {
      setError('No se pudo cambiar el estado de la reserva. Intenta de nuevo.')
      return
    }
    // Con un filtro de estado puesto, la cita ya no pertenece a esta lista
    if (statusFilter !== 'all' && status !== statusFilter) removeFromList(id)
    else setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }

  const deleteAppointment = (id: string) => {
    confirmAction(
      { title: '¿Eliminar esta reserva?', message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', destructive: true },
      async () => {
        const { error } = await createClient().from('appointments').delete().eq('id', id)
        if (error) {
          setError('No se pudo eliminar la reserva. Intenta de nuevo.')
          return
        }
        removeFromList(id)
      }
    )
  }

  // La pestaña y el filtro ya vienen resueltos desde la base de datos
  const filtered = appointments
  const remaining = total - appointments.length

  const todayTz = toZonedTime(new Date(), TZ)
  const grouped = (() => {
    const groups: { label: string; items: typeof filtered }[] = []
    for (const appt of filtered) {
      const apptTz = toZonedTime(parseISO(appt.start_time), TZ)
      let label: string
      if (isSameDay(apptTz, todayTz)) label = 'Hoy'
      else if (isSameDay(apptTz, addDays(todayTz, 1))) label = 'Mañana'
      else label = format(apptTz, "EEEE d 'de' MMM", { locale: es })
      const existing = groups.find(g => g.label === label)
      if (existing) existing.items.push(appt)
      else groups.push({ label, items: [appt] })
    }
    return groups
  })()

  return (
    <div className="p-6 max-w-4xl ios-push">
      <div className="mb-6">
        <LargeTitle
          title="Mis reservas"
          subtitle={loading ? 'Cargando…' : subtitleFor(tab, total)}
          action={
            <Link
              href="/agendar?from=admin"
              className="glass-gold flex items-center gap-1.5 text-bg-primary text-xs font-bold px-4 py-2.5 rounded-full hover:brightness-110 transition-all ios-press flex-shrink-0"
            >
              <Plus size={14} />
              Nueva cita
            </Link>
          }
        />
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <SegmentedControl
          ariaLabel="Filtrar reservas por fecha"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: 'Próximas' },
            { value: 'past', label: 'Pasadas' },
            { value: 'all', label: 'Todas' },
          ] as const}
        />
      </div>

      {/* Filtros estado */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['all','confirmed','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3.5 py-2 rounded-full font-medium transition-colors ios-press ${statusFilter === s ? 'glass text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            {s === 'all' ? 'Todos los estados' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-2xl flex items-start justify-between gap-3" role="alert">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-400/70 underline flex-shrink-0">Cerrar</button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-3xl" />)}
        </div>
      ) : (
      <div className="space-y-3">
        {grouped.map(({ label, items }) => (
          <div key={label}>
            <div className="px-1 py-2 mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</span>
            </div>
            {items.map((appt) => {
          const startDate = parseISO(appt.start_time)
          const past = isPast(startDate)

          return (
            <div key={appt.id} className="mb-3 ios-step">
              <SwipeableRow
                actions={[
                  ...(!past && appt.status !== 'completed' && appt.status !== 'cancelled'
                    ? [{
                        label: 'Completar',
                        icon: <Check size={17} />,
                        onClick: () => updateStatus(appt.id, 'completed'),
                      }]
                    : []),
                  {
                    label: 'Eliminar',
                    icon: <Trash2 size={17} />,
                    onClick: () => deleteAppointment(appt.id),
                    variant: 'destructive' as const,
                  },
                ]}
              >
            <div className={`card p-4 ${past ? 'opacity-70' : ''}`}>
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
                    {appt.cancellation_code && !past && appt.status !== 'cancelled' && (
                      <span className="flex items-center gap-1 text-gold">
                        <KeyRound size={10} />
                        Código: <span className="font-bold tracking-wider">{appt.cancellation_code}</span>
                      </span>
                    )}
                  </div>
                  {appt.notes && <p className="text-xs text-text-muted mt-1.5 italic">"{appt.notes}"</p>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!past && appt.customer?.phone && (
                    <button
                      onClick={async () => {
                        if (appt.status === 'sync_pending') await updateStatus(appt.id, 'confirmed')
                        const startDate2 = parseISO(appt.start_time)
                        const mapsLine = mapsUrl ? `\nComo llegar: ${mapsUrl}` : ''
                        const msg = `Hola, *${appt.customer?.name}*.\n\nLe recordamos su cita en *Artist Studio* con Andres:\n\nFecha: *${format(startDate2, "d 'de' MMMM", { locale: es })}*\nHora: *${format(startDate2, 'h:mm a')}*\nServicio: ${appt.service?.name}${mapsLine}\n\nLe esperamos.`
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
              </SwipeableRow>
            </div>
          )
        })}
          </div>
        ))}
        {filtered.length === 0 && !error && (
          <div className="card p-12 text-center">
            <p className="text-text-secondary">No hay reservas aquí</p>
          </div>
        )}

        {remaining > 0 && (
          <div className="pt-2 pb-4 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="glass w-full py-3.5 rounded-full text-sm font-semibold text-text-primary hover:bg-white/10 transition-colors ios-press disabled:opacity-60"
            >
              {loadingMore ? 'Cargando…' : `Cargar más (${remaining} más)`}
            </button>
            <p className="text-text-muted text-xs mt-2">
              Mostrando {appointments.length} de {total}
            </p>
          </div>
        )}
      </div>
      )}

      {confirmSheet}
    </div>
  )
}
