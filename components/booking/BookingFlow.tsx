'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Edit2, ChevronLeft, Scissors } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ServiceSelector } from './ServiceSelector'
import { DateSelector } from './DateSelector'
import { TimeSelector } from './TimeSelector'
import { CustomerForm, type CustomerFormValues } from './CustomerForm'
import { BookingSuccess } from './BookingSuccess'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice, formatDuration } from '@/lib/utils'
import { haptic } from '@/lib/haptics'
import { CountUpPrice } from '@/components/ui/CountUpPrice'
import type {
  Barbershop,
  Barber,
  Service,
  DayAvailability,
  TimeSlot,
} from '@/types'

interface BookingFlowProps {
  barbershop: Barbershop
  barbers: Barber[]
  services: Service[]
  initialBarberId?: string
}

// Chip de selección completada
function SelectionChip({
  label,
  value,
  sub,
  price,
  morphName,
  onEdit,
}: {
  label: string
  value: string
  sub?: string
  price?: number | null
  morphName?: string
  onEdit: () => void
}) {
  return (
    <div
      className="glass flex items-center justify-between px-4 py-3 rounded-3xl mb-3 ios-reveal"
      style={morphName ? ({ viewTransitionName: morphName } as React.CSSProperties) : undefined}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0 ios-pop">
          <Check size={12} className="text-bg-primary" />
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-text-primary leading-tight">{value}</p>
          {sub && (
            <p className="text-[11px] text-text-muted mt-0.5">
              {sub}
              {price != null && (
                <>
                  {' · '}
                  <CountUpPrice value={price} className="text-gold font-semibold" />
                </>
              )}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors py-1 px-2 rounded-lg hover:bg-gold/10"
      >
        <Edit2 size={11} />
        Cambiar
      </button>
    </div>
  )
}

// Título de sección activa
function SectionTitle({ number, title, sub }: { number: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 ios-reveal">
      <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center flex-shrink-0 ios-pop">
        <span className="text-xs font-bold text-bg-primary">{number}</span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-text-primary leading-tight">{title}</h2>
        <p className="text-text-secondary text-xs">{sub}</p>
      </div>
    </div>
  )
}

export function BookingFlow({
  barbershop,
  barbers,
  services,
  initialBarberId,
}: BookingFlowProps) {
  // Siempre usar el primer barbero (Andrés es el único)
  const defaultBarberId = initialBarberId ?? barbers[0]?.id ?? null

  const searchParams = useSearchParams()
  const returnToAdmin = searchParams.get('from') === 'admin'

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [cancellationCode, setCancellationCode] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<CustomerFormValues | null>(null)
  const [savedCustomer, setSavedCustomer] = useState<Partial<CustomerFormValues> | null>(null)

  // Cargar datos previos del cliente desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('barberbook_customer')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.phone || parsed?.name) {
          setSavedCustomer(parsed)
        }
      }
    } catch {}
  }, [])

  // Refs para auto-scroll
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const selectedBarber = barbers.find((b) => b.id === defaultBarberId) ?? null
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null
  const currentDaySlots = availability.find((d) => d.date === selectedDate)?.slots ?? []

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Cargar disponibilidad cuando cambia servicio
  useEffect(() => {
    if (!defaultBarberId || !selectedServiceId) return
    setLoadingAvailability(true)
    setSelectedDate(null)
    setSelectedSlot(null)
    fetch(`/api/availability?barberId=${defaultBarberId}&serviceId=${selectedServiceId}&barbershopId=${barbershop.id}`)
      .then((r) => r.json())
      .then((data) => setAvailability(data.days ?? []))
      .catch(() => setError('Error cargando disponibilidad'))
      .finally(() => setLoadingAvailability(false))
  }, [selectedServiceId, defaultBarberId, barbershop.id])

  /**
   * Con View Transitions el navegador interpola entre la tarjeta del servicio
   * y la fila de resumen (comparten view-transition-name), así que parece que
   * una se transforma en la otra. Donde no exista, cambia normal.
   */
  const withMorph = (update: () => void) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void
    }
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(update)
    } else {
      update()
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    haptic('light')
    withMorph(() => {
      setSelectedServiceId(serviceId)
      setSelectedDate(null)
      setSelectedSlot(null)
    })
    scrollTo(dateRef)
  }

  const handleDateSelect = (date: string) => {
    haptic('light')
    setSelectedDate(date)
    setSelectedSlot(null)
    scrollTo(timeRef)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    haptic('medium')
    setSelectedSlot(slot)
    scrollTo(formRef)
  }

  const handleFormSubmit = async (data: CustomerFormValues) => {
    if (!defaultBarberId || !selectedServiceId || !selectedDate || !selectedSlot) return
    setCustomerData(data)
    setIsConfirming(true)
    setError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          barber_id: defaultBarberId,
          service_id: selectedServiceId,
          customer: {
            name: data.name,
            phone: data.phone,
          },
          start_time: selectedSlot.startTime,
          notes: data.notes || undefined,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        setError(result.error || 'Error al crear la cita. Intenta de nuevo.')
        return
      }

      // Guardar datos del cliente para próximas citas
      localStorage.setItem('barberbook_customer', JSON.stringify({ name: data.name, phone: data.phone }))
      haptic('success')
      setSuccess(true)
      setAppointmentId(result.appointment?.id ?? null)
      setCancellationCode(result.appointment?.cancellation_code ?? null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleBookAnother = () => {
    setSelectedServiceId(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setCustomerData(null)
    setError(null)
    setSuccess(false)
    setAppointmentId(null)
    setCancellationCode(null)
  }

  // Pantalla de éxito
  if (success && selectedBarber && selectedService && selectedDate && selectedSlot && customerData) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-lg mx-auto px-4 py-6">
          <BookingSuccess
            barbershop={barbershop}
            barber={selectedBarber}
            service={selectedService}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            customerName={customerData.name}
            customerPhone={customerData.phone}
            onBookAnother={handleBookAnother}
            returnToAdmin={returnToAdmin}
            appointmentId={appointmentId}
            cancellationCode={cancellationCode}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="glass-dark sticky top-[calc(env(safe-area-inset-top)+10px)] z-10 mx-3 mt-[calc(env(safe-area-inset-top)+10px)] rounded-full">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={returnToAdmin ? '/admin' : '/'}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
            <p className="text-xs text-text-muted">{barbershop.name}</p>
            <p className="text-sm font-semibold text-text-primary">
              {returnToAdmin ? 'Nueva cita — Panel' : 'Reserva con Andrés'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-2">

        {/* Tarjeta de Andrés */}
        {selectedBarber && (
          <div className="glass flex items-center gap-4 p-4 rounded-3xl mb-2">
            <div className="flex-shrink-0">
              {selectedBarber.photo_url ? (
                <Image
                  src={selectedBarber.photo_url}
                  alt={selectedBarber.name}
                  width={64}
                  height={64}
                  className="rounded-xl object-cover w-16 h-16"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Scissors size={24} className="text-gold" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-text-muted uppercase tracking-wide mb-0.5">Tu barbero</p>
              <p className="font-bold text-text-primary text-base leading-tight">{selectedBarber.name}</p>
              {selectedBarber.specialty && (
                <p className="text-gold text-xs mt-0.5">{selectedBarber.specialty}</p>
              )}
              {selectedBarber.description && (
                <p className="text-text-muted text-xs mt-1 line-clamp-1">{selectedBarber.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Error global */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/40 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-400/70 mt-1 underline">
              Cerrar
            </button>
          </div>
        )}

        {/* ── PASO 1: Servicio ── */}
        <div>
          {selectedServiceId ? (
            <SelectionChip
              label="Servicio"
              morphName="servicio-elegido"
              value={selectedService?.name ?? ''}
              sub={selectedService ? formatDuration(selectedService.duration_minutes) : undefined}
              price={selectedService?.price ?? null}
              onEdit={() => {
                setSelectedServiceId(null)
                setSelectedDate(null)
                setSelectedSlot(null)
              }}
            />
          ) : (
            <div>
              <SectionTitle number={1} title="Elige un servicio" sub="¿Qué te vamos a hacer hoy?" />
              <ServiceSelector
                services={services}
                selectedServiceId={selectedServiceId}
                onSelect={handleServiceSelect}
              />
            </div>
          )}
        </div>

        {/* ── PASO 2: Día ── */}
        {selectedServiceId && (
          <div ref={dateRef}>
            {selectedDate ? (
              <SelectionChip
                label="Día"
                value={format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
                onEdit={() => {
                  setSelectedDate(null)
                  setSelectedSlot(null)
                }}
              />
            ) : (
              <div>
                <SectionTitle number={2} title="Elige un día" sub="Próximos días disponibles" />
                {loadingAvailability ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <LoadingSpinner />
                    <p className="text-text-secondary text-sm">Buscando horarios...</p>
                  </div>
                ) : (
                  <DateSelector
                    days={availability}
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PASO 3: Hora ── */}
        {selectedDate && (
          <div ref={timeRef}>
            {selectedSlot ? (
              <SelectionChip
                label="Hora"
                value={selectedSlot.label}
                onEdit={() => setSelectedSlot(null)}
              />
            ) : (
              <div>
                <SectionTitle number={3} title="Elige tu hora" sub="Horarios disponibles para ese día" />
                <TimeSelector
                  slots={currentDaySlots}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                  serviceName={selectedService?.name}
                />
              </div>
            )}
          </div>
        )}

        {/* ── PASO 4: Datos + Confirmar ── */}
        {selectedSlot && (
          <div ref={formRef} className="pt-2">
            <SectionTitle
              number={4}
              title="Tus datos"
              sub={savedCustomer?.phone ? 'Hemos rellenado tus datos automáticamente' : 'Solo necesitamos lo básico'}
            />
            <CustomerForm
              defaultValues={customerData ?? savedCustomer ?? undefined}
              onSubmit={handleFormSubmit}
              isLoading={isConfirming}
            />
          </div>
        )}
      </div>
    </div>
  )
}
