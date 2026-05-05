'use client'
import { useRouter } from 'next/navigation'
import { format, parseISO, isSameDay, addDays, isPast } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import { MessageCircle, Trash2, Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { buildWhatsAppLink } from '@/lib/utils'

const TZ = 'America/Bogota'

interface Appt {
  id: string
  start_time: string
  status: string
  service: { name: string } | null
  customer: { name: string; phone: string } | null
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmada',
  sync_pending: 'No confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'text-green-400 bg-green-900/30',
  sync_pending: 'text-red-400 bg-red-900/20',
  completed: 'text-blue-400 bg-blue-900/20',
  cancelled: 'text-red-400 bg-red-900/20',
  no_show: 'text-yellow-400 bg-yellow-900/20',
}

function dateLabel(dateInTz: Date, todayInTz: Date): string {
  if (isSameDay(dateInTz, todayInTz)) return 'Hoy'
  if (isSameDay(dateInTz, addDays(todayInTz, 1))) return 'Mañana'
  return format(dateInTz, "EEEE d 'de' MMMM", { locale: es })
}

export function UpcomingAppointments({ appointments, mapsUrl }: { appointments: Appt[], mapsUrl?: string | null }) {
  const router = useRouter()
  const todayInTz = toZonedTime(new Date(), TZ)

  const confirmAndRemind = async (appt: Appt) => {
    // Mark as confirmed if pending
    if (appt.status === 'sync_pending') {
      await fetch(`/api/appointments/${appt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      }).catch(() => {})
    }
    // Build WhatsApp reminder message
    const startInTz = toZonedTime(parseISO(appt.start_time), TZ)
    const date = format(startInTz, "EEEE d 'de' MMMM", { locale: es })
    const time = format(startInTz, 'h:mm a').replace('AM','am').replace('PM','pm')
    const mapsLine = mapsUrl ? `\nComo llegar: ${mapsUrl}` : ''
    const msg = `Hola, *${appt.customer?.name}*.\n\nLe recordamos su cita en *Artist Studio* con Andres:\n\nFecha: *${date}*\nHora: *${time}*\nServicio: ${appt.service?.name}${mapsLine}\n\nLe esperamos.`
    const link = buildWhatsAppLink(appt.customer!.phone, msg)
    window.open(link, '_blank')
    router.refresh()
  }

  const deleteAppt = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return
    const supabase = createClient()
    await supabase.from('appointments').delete().eq('id', id)
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <Clock size={32} className="text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No hay citas próximas</p>
        <Link href="/agendar?from=admin" className="inline-flex items-center gap-1.5 text-gold text-sm font-medium mt-4 hover:text-gold-light">
          <Plus size={14} />
          Agregar cita
        </Link>
      </div>
    )
  }

  // Group by date label
  const groups: { label: string; items: Appt[] }[] = []
  for (const appt of appointments) {
    const apptInTz = toZonedTime(parseISO(appt.start_time), TZ)
    const label = dateLabel(apptInTz, todayInTz)
    const existing = groups.find(g => g.label === label)
    if (existing) existing.items.push(appt)
    else groups.push({ label, items: [appt] })
  }

  return (
    <div className="divide-y divide-border">
      {groups.map(group => (
        <div key={group.label}>
          <div className="px-5 py-2 bg-bg-tertiary">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">{group.label}</span>
          </div>
          {group.items.map(appt => {
            const startInTz = toZonedTime(parseISO(appt.start_time), TZ)
            const past = isPast(parseISO(appt.start_time))
            return (
              <div key={appt.id} className={`flex items-center gap-3 px-5 py-3.5 ${past ? 'opacity-60' : ''}`}>
                {/* Hora */}
                <div className="flex-shrink-0 text-center w-12">
                  <p className="text-gold text-sm font-bold">{format(startInTz, 'h:mm')}</p>
                  <p className="text-text-muted text-xs">{format(startInTz, 'a').toLowerCase()}</p>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">{appt.customer?.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-text-muted text-xs truncate">{appt.service?.name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[appt.status] ?? 'text-text-muted bg-bg-tertiary'}`}>
                      {STATUS_LABEL[appt.status] ?? appt.status}
                    </span>
                  </div>
                </div>
                {/* Acciones */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!past && appt.customer?.phone && (
                    <button
                      onClick={() => confirmAndRemind(appt)}
                      className="p-2 rounded-lg text-text-muted hover:text-whatsapp hover:bg-green-900/20 transition-colors"
                      title="Recordar al cliente"
                    >
                      <MessageCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAppt(appt.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
