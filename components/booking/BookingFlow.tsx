'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, Edit2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { BarberSelector } from './BarberSelector'
import { ServiceSelector } from './ServiceSelector'
import { DateSelector } from './DateSelector'
import { TimeSelector } from './TimeSelector'
import { CustomerForm, type CustomerFormValues } from './CustomerForm'
import { BookingSuccess } from './BookingSuccess'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatPrice, formatDuration } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
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

interface AvailabilityState {
  [barberId: string]: DayAvailability[]
}

// Chip de selección completada
function SelectionChip({
  label,
  value,
  sub,
  onEdit,
}: {
  label: string
  value: string
  sub?: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary rounded-2xl border border-border mb-3">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
          <Check size={12} className="text-bg-primary" />
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-text-primary leading-tight">{value}</p>
          {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
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
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
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
  const { user } = useUser()
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(initialBarberId ?? null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availability, setAvailability] = useState<AvailabilityState>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerFormValues | null>(null)
  const [savedCustomer, setSavedCustomer] = useState<Partial<CustomerFormValues> | null>(null)

  // Cuando el usuario está logueado, buscar sus datos anteriores
  useEffect(() => {
    if (!user) return
    const googleName = user.user_metadata?.name ?? ''
    const googleEmail = user.email ?? ''

    // 1. Pre-rellenar con datos de Google inmediatamente
    const base = { name: googleName, email: googleEmail }

    // 2. Revisar localStorage por si ya agendó antes
    const stored = localStorage.getItem('barberbook_customer')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSavedCustomer({ ...base, ...parsed })
        return
      } catch {}
    }

    setSavedCustomer(base)

    // 3. Intentar buscar en BD
    if (!googleEmail) return
    createClient()
      .from('customers')
      .select('name, phone, email')
      .eq('email', googleEmail)
      .not('phone', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.phone) {
          const full = { name: data.name ?? googleName, phone: data.phone, email: data.email ?? googleEmail }
          setSavedCustomer(full)
          localStorage.setItem('barberbook_customer', JSON.stringify({ phone: data.phone, name: data.name }))
        }
      })
  }, [user])

  // Refs para auto-scroll a cada nueva sección
  const serviceRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) ?? null
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null
  const currentDays = selectedBarberId ? availability[selectedBarberId] ?? [] : []
  const currentDaySlots = currentDays.find((d) => d.date === selectedDate)?.slots ?? []

  // Auto-scroll suave a nueva sección
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Cargar disponibilidad para todos los barberos (preview en selector)
  useEffect(() => {
    const firstService = services[0]
    if (!firstService) return
    barbers.forEach((barber) => {
      if (availability[barber.id]) return
      fetch(`/api/availability?barberId=${barber.id}&serviceId=${firstService.id}&barbershopId=${barbershop.id}`)
        .then((r) => r.json())
        .then((data) => setAvailability((prev) => ({ ...prev, [barber.id]: data.days })))
        .catch(() => {})
    })
  }, [barbers, barbershop.id, services]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar disponibilidad real cuando cambia barbero+servicio
  useEffect(() => {
    if (!selectedBarberId || !selectedServiceId) return
    setLoadingAvailability(true)
    setSelectedDate(null)
    setSelectedSlot(null)
    fetch(`/api/availability?barberId=${selectedBarberId}&serviceId=${selectedServiceId}&barbershopId=${barbershop.id}`)
      .then((r) => r.json())
      .then((data) => setAvailability((prev) => ({ ...prev, [selectedBarberId]: data.days })))
      .catch(() => setError('Error cargando disponibilidad'))
      .finally(() => setLoadingAvailability(false))
  }, [selectedBarberId, selectedServiceId, barbershop.id])

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId)
    setSelectedServiceId(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    scrollTo(serviceRef)
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    setSelectedDate(null)
    setSelectedSlot(null)
    scrollTo(dateRef)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    scrollTo(timeRef)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    scrollTo(formRef)
  }

  const handleFormSubmit = async (data: CustomerFormValues) => {
    if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedSlot) return
    setCustomerData(data)
    setIsConfirming(true)
    setError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          barber_id: selectedBarberId,
          service_id: selectedServiceId,
          customer: {
            name: data.name,
            phone: data.phone,
            email: data.email || undefined,
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
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleBookAnother = () => {
    setSelectedBarberId(null)
    setSelectedServiceId(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setCustomerData(null)
    setError(null)
    setSuccess(false)
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
            onBookAnother={handleBookAnother}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-bg-secondary transition-colors"
          >
            <ChevronLeft size={20} className="text-text-secondary" />
          </Link>
          <div>
            <p className="text-xs text-text-muted">{barbershop.name}</p>
            <p className="text-sm font-semibold text-text-primary">Reserva tu cita</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-2">

        {/* Error global */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-400/70 mt-1 underline">
              Cerrar
            </button>
          </div>
        )}

        {/* ── PASO 1: Barbero ── */}
        {selectedBarberId ? (
          <SelectionChip
            label="Barbero"
            value={selectedBarber?.name ?? ''}
            sub={selectedBarber?.specialty ?? undefined}
            onEdit={() => {
              setSelectedBarberId(null)
              setSelectedServiceId(null)
              setSelectedDate(null)
              setSelectedSlot(null)
            }}
          />
        ) : (
          <div>
            <SectionTitle number={1} title="Elige tu barbero" sub="Selecciona con quién quieres tu cita" />
            <BarberSelector
              barbers={barbers}
              selectedBarberId={selectedBarberId}
              availability={availability}
              onSelect={handleBarberSelect}
            />
          </div>
        )}

        {/* ── PASO 2: Servicio ── */}
        {selectedBarberId && (
          <div ref={serviceRef}>
            {selectedServiceId ? (
              <SelectionChip
                label="Servicio"
                value={selectedService?.name ?? ''}
                sub={selectedService ? `${formatDuration(selectedService.duration_minutes)} · ${formatPrice(selectedService.price)}` : undefined}
                onEdit={() => {
                  setSelectedServiceId(null)
                  setSelectedDate(null)
                  setSelectedSlot(null)
                }}
              />
            ) : (
              <div>
                <SectionTitle number={2} title="Elige un servicio" sub="¿Qué te vamos a hacer hoy?" />
                <ServiceSelector
                  services={services}
                  selectedServiceId={selectedServiceId}
                  onSelect={handleServiceSelect}
                />
              </div>
            )}
          </div>
        )}

        {/* ── PASO 3: Día ── */}
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
                <SectionTitle number={3} title="Elige un día" sub="Próximos días disponibles" />
                {loadingAvailability ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <LoadingSpinner />
                    <p className="text-text-secondary text-sm">Buscando horarios...</p>
                  </div>
                ) : (
                  <DateSelector
                    days={currentDays}
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PASO 4: Hora ── */}
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
                <SectionTitle number={4} title="Elige tu hora" sub="Horarios disponibles para ese día" />
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

        {/* ── PASO 5: Datos + Confirmar ── */}
        {selectedSlot && (
          <div ref={formRef} className="pt-2">
            <SectionTitle number={5} title="Tus datos" sub={savedCustomer?.phone ? "Hemos rellenado tus datos automáticamente" : "Solo necesitamos lo básico"} />
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
