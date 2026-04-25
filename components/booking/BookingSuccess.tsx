'use client'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, MapPin, MessageCircle, RefreshCw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { buildWhatsAppLink, buildBookingWhatsAppMessage } from '@/lib/utils'
import { addToClientCalendar } from '@/lib/google-calendar-client'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import type { Barber, Service, TimeSlot, Barbershop } from '@/types'

interface BookingSuccessProps {
  barbershop: Barbershop
  barber: Barber
  service: Service
  selectedDate: string
  selectedSlot: TimeSlot
  customerName: string
  onBookAnother: () => void
}

export function BookingSuccess({
  barbershop,
  barber,
  service,
  selectedDate,
  selectedSlot,
  customerName,
  onBookAnother,
}: BookingSuccessProps) {
  const { user, googleToken } = useUser()
  const [calendarAdded, setCalendarAdded] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarError, setCalendarError] = useState(false)

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

  const whatsappLink = barbershop.whatsapp
    ? buildWhatsAppLink(barbershop.whatsapp, whatsappMessage)
    : null

  const mapsLink = barbershop.google_maps_url || null

  // Si el usuario está logueado con Google, agregar al calendario automáticamente
  const handleAddToCalendar = async () => {
    setCalendarLoading(true)
    setCalendarError(false)

    let token = googleToken

    // Si no hay token, pedir login con Google
    if (!token) {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.events',
          redirectTo: window.location.href,
        },
      })
      return
    }

    const result = await addToClientCalendar({
      title: `✂️ Cita en ${barbershop.name} con ${barber.name}`,
      description: `Servicio: ${service.name}\nBarbero: ${barber.name}\nDirección: ${barbershop.address || ''}\nContacto: ${barbershop.whatsapp || ''}`,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      location: barbershop.address || '',
      accessToken: token,
    })

    if (result.success) {
      setCalendarAdded(true)
    } else {
      setCalendarError(true)
    }
    setCalendarLoading(false)
  }

  return (
    <div className="animate-slide-up flex flex-col items-center text-center">
      {/* Ícono de éxito */}
      <div className="w-20 h-20 rounded-full bg-green-900/30 flex items-center justify-center mb-6 mt-2">
        <CheckCircle size={44} className="text-green-400" strokeWidth={1.5} />
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-2">
        ¡Cita agendada!
      </h2>
      <p className="text-text-secondary mb-8">
        Te esperamos en{' '}
        <span className="text-text-primary font-medium">{barbershop.name}</span>
      </p>

      {/* Detalles */}
      <div className="w-full card p-5 text-left mb-6">
        <div className="space-y-3">
          <DetailRow label="Barbero" value={barber.name} />
          <DetailRow label="Servicio" value={service.name} />
          <DetailRow label="Día" value={dateFormatted} />
          <DetailRow label="Hora" value={selectedSlot.label} />
          {barbershop.address && (
            <DetailRow label="Dirección" value={barbershop.address} />
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="w-full flex flex-col gap-3">
        {/* Google Calendar */}
        {calendarAdded ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-900/20 border border-green-800/30 text-green-400 text-sm font-medium">
            <Calendar size={16} />
            ¡Agregado a tu Google Calendar!
          </div>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleAddToCalendar}
            loading={calendarLoading}
          >
            <Calendar size={16} className="mr-2" />
            {user ? 'Agregar a Google Calendar' : 'Sincronizar con Google Calendar'}
          </Button>
        )}

        {calendarError && (
          <p className="text-red-400 text-xs text-center">
            No se pudo agregar al calendario. Intenta de nuevo.
          </p>
        )}

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
