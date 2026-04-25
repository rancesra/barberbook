'use client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Phone, Mail, Scissors, Calendar, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDuration } from '@/lib/utils'
import type { Barber, Service, TimeSlot, Barbershop } from '@/types'

interface BookingSummaryProps {
  barbershop: Barbershop
  barber: Barber
  service: Service
  selectedDate: string
  selectedSlot: TimeSlot
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
  onConfirm: () => void
  onBack: () => void
  isLoading?: boolean
}

interface SummaryRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="text-gold flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-text-muted mb-0.5">{label}</p>
        <p className="text-text-primary font-medium">{value}</p>
      </div>
    </div>
  )
}

export function BookingSummary({
  barbershop,
  barber,
  service,
  selectedDate,
  selectedSlot,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  onConfirm,
  onBack,
  isLoading,
}: BookingSummaryProps) {
  const dateFormatted = format(parseISO(selectedDate + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="animate-slide-up">
      <h2 className="text-xl font-bold text-text-primary mb-1">Resumen de tu cita</h2>
      <p className="text-text-secondary text-sm mb-5">Verifica todo antes de confirmar</p>

      <div className="card p-4 mb-5">
        <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
          Tu cita
        </p>
        <SummaryRow
          icon={<Scissors size={16} />}
          label="Barbería"
          value={barbershop.name}
        />
        <SummaryRow
          icon={<User size={16} />}
          label="Barbero"
          value={barber.name}
        />
        <SummaryRow
          icon={<Scissors size={16} />}
          label="Servicio"
          value={`${service.name} (${formatDuration(service.duration_minutes)})`}
        />
        <SummaryRow
          icon={<Calendar size={16} />}
          label="Día"
          value={dateFormatted}
        />
        <SummaryRow
          icon={<Clock size={16} />}
          label="Hora"
          value={selectedSlot.label}
        />
        {barbershop.address && (
          <SummaryRow
            icon={<MapPin size={16} />}
            label="Dirección"
            value={barbershop.address}
          />
        )}
      </div>

      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
          Tus datos
        </p>
        <SummaryRow icon={<User size={16} />} label="Nombre" value={customerName} />
        <SummaryRow icon={<Phone size={16} />} label="Teléfono" value={customerPhone} />
        {customerEmail && (
          <SummaryRow icon={<Mail size={16} />} label="Correo" value={customerEmail} />
        )}
        {notes && (
          <div className="py-3">
            <p className="text-xs text-text-muted mb-0.5">Nota</p>
            <p className="text-text-secondary text-sm">{notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onConfirm} loading={isLoading} fullWidth>
          Confirmar cita
        </Button>
        <Button variant="secondary" onClick={onBack} fullWidth disabled={isLoading}>
          Cambiar algo
        </Button>
      </div>
    </div>
  )
}
