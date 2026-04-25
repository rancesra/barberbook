import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Phone, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { buildWhatsAppLink } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

export default async function ReservasPage() {
  const supabase = createAdminClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      barber:barbers(name, photo_url),
      service:services(name, duration_minutes),
      customer:customers(name, phone, email)
    `)
    .order('start_time', { ascending: false })
    .limit(100)

  const STATUS_LABELS: Record<AppointmentStatus, string> = {
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    no_show: 'No asistió',
    sync_pending: 'Pendiente sync',
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reservas</h1>
        <p className="text-text-secondary text-sm mt-1">
          {appointments?.length ?? 0} reservas registradas
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Barbero</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Servicio</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Hora</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments?.map((appt) => {
                const customer = appt.customer as Record<string, string>
                const barber = appt.barber as Record<string, string>
                const service = appt.service as Record<string, string>
                const startDate = new Date(appt.start_time)
                const waMsg = `Hola ${customer?.name}, te recordamos tu cita para el ${format(startDate, "d 'de' MMMM")} a las ${format(startDate, 'h:mm a')}.`
                const waLink = customer?.phone ? buildWhatsAppLink(customer.phone, waMsg) : null

                return (
                  <tr key={appt.id} className="hover:bg-bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{customer?.name}</p>
                      <p className="text-text-muted text-xs flex items-center gap-1">
                        <Phone size={10} />
                        {customer?.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{barber?.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{service?.name}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {format(startDate, "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {format(startDate, 'h:mm a')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={appt.status as AppointmentStatus} label={STATUS_LABELS[appt.status as AppointmentStatus]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-whatsapp hover:bg-green-900/20 transition-colors"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
