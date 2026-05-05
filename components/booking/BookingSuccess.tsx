'use client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, MapPin, MessageCircle, RefreshCw, LayoutDashboard, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildWhatsAppLink, buildBookingWhatsAppMessage } from '@/lib/utils'
import Link from 'next/link'
import type { Barber, Service, TimeSlot, Barbershop } from '@/types'

interface BookingSuccessProps {
  barbershop: Barbershop
  barber: Barber
  service: Service
  selectedDate: string
  selectedSlot: TimeSlot
  customerName: string
  customerPhone?: string
  onBookAnother: () => void
  returnToAdmin?: boolean
}

export function BookingSuccess({
  barbershop,
  barber,
  service,
  selectedDate,
  selectedSlot,
  customerName,
  customerPhone,
  onBookAnother,
  returnToAdmin,
}: BookingSuccessProps) {
  const dateFormatted = format(
    parseISO(selectedDate + 'T00:00:00'),
    "EEEE d 'de' MMMM",
    { locale: es }
  )

  const whatsappMessage = buildBookingWhatsAppMessage({
    customerName,
    barberName: barber.name,
    serviceName: service.name,
    date: dateFormatted,
    time: selectedSlot.label,
    barbershopName: barbershop.name,
  })

  const whatsappNumber = barber.phone || barbershop.whatsapp
  const whatsappLink = whatsappNumber
    ? buildWhatsAppLink(whatsappNumber, whatsappMessage)
    : null

  // Mensaje de notificación al cliente (para cuando Andrés agenda desde el panel)
  const clientNotifMessage = customerPhone
    ? buildWhatsAppLink(
        customerPhone,
        `Hola ${customerName} 👋 Tu cita en *${barbershop.name}* ha sido confirmada:\n\n📅 ${dateFormatted} a las *${selectedSlot.label}*\n✂️ ${service.name}\n\n¡Te esperamos!`
      )
    : null

  const mapsLink = barbershop.google_maps_url || null

  return (
    <div className="animate-slide-up flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center mb-6 mt-2">
        <CheckCircle size={44} className="text-green-400" strokeWidth={1.5} />
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-2">
        ¡Cita agendada!
      </h2>
      <p className="text-text-secondary mb-8">
        {returnToAdmin ? 'La cita fue registrada correctamente.' : (
          <>Te esperamos en{' '}<span className="text-text-primary font-medium">{barbershop.name}</span></>
        )}
      </p>

      <div className="w-full card p-5 text-left mb-6">
        <div className="space-y-3">
          <DetailRow label="Cliente" value={customerName} />
          <DetailRow label="Servicio" value={service.name} />
          <DetailRow label="Día" value={dateFormatted} />
          <DetailRow label="Hora" value={selectedSlot.label} />
          {!returnToAdmin && barbershop.address && (
            <DetailRow label="Dirección" value={barbershop.address} />
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        {returnToAdmin ? (
          <>
            {clientNotifMessage && (
              <a href={clientNotifMessage} target="_blank" rel="noopener noreferrer" className="w-full">
                <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-2xl transition-colors text-sm">
                  <MessageCircle size={17} />
                  Enviar confirmación al cliente
                </button>
              </a>
            )}
            <Link href="/admin/reservas" className="w-full">
              <Button fullWidth>
                <LayoutDashboard size={16} className="mr-2" />
                Ver mis reservas
              </Button>
            </Link>
            <Button variant="ghost" onClick={onBookAnother} fullWidth>
              <RefreshCw size={16} className="mr-2" />
              Agendar otra cita
            </Button>
          </>
        ) : (
          <>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="whatsapp" fullWidth>
                  <MessageCircle size={18} />
                  Confirmar por WhatsApp
                </Button>
              </a>
            )}
            {mapsLink && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="secondary" fullWidth>
                  <MapPin size={18} className="mr-1" />
                  Ver ubicación
                </Button>
              </a>
            )}
            <Button variant="ghost" onClick={onBookAnother} fullWidth>
              <RefreshCw size={16} className="mr-2" />
              Agendar otra cita
            </Button>
            <Link href="/" className="w-full">
              <Button variant="ghost" fullWidth>
                <Home size={16} className="mr-2" />
                Volver a la página principal
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-text-muted text-sm flex-shrink-0">{label}</span>
      <span className="text-text-primary text-sm font-medium text-right">{value}</span>
    </div>
  )
}
