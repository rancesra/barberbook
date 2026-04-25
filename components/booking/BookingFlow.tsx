'use client'
import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { BarberSelector } from './BarberSelector'
import { ServiceSelector } from './ServiceSelector'
import { DateSelector } from './DateSelector'
import { TimeSelector } from './TimeSelector'
import { CustomerForm, type CustomerFormValues } from './CustomerForm'
import { BookingSummary } from './BookingSummary'
import { BookingSuccess } from './BookingSuccess'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type {
  Barbershop,
  Barber,
  Service,
  DayAvailability,
  TimeSlot,
} from '@/types'

type BookingStep =
  | 'barber'
  | 'service'
  | 'date'
  | 'time'
  | 'form'
  | 'summary'
  | 'success'

const STEPS = [
  { label: 'Barbero' },
  { label: 'Servicio' },
  { label: 'Día' },
  { label: 'Hora' },
  { label: 'Datos' },
]

const STEP_ORDER: BookingStep[] = ['barber', 'service', 'date', 'time', 'form', 'summary', 'success']

interface BookingFlowProps {
  barbershop: Barbershop
  barbers: Barber[]
  services: Service[]
  initialBarberId?: string
}

interface AvailabilityState {
  [barberId: string]: DayAvailability[]
}

export function BookingFlow({
  barbershop,
  barbers,
  services,
  initialBarberId,
}: BookingFlowProps) {
  const [step, setStep] = useState<BookingStep>(initialBarberId ? 'service' : 'barber')
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(initialBarberId ?? null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [customerData, setCustomerData] = useState<CustomerFormValues | null>(null)
  const [availability, setAvailability] = useState<AvailabilityState>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedBarber = barbers.find((b) => b.id === selectedBarberId) ?? null
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null
  const currentDays = selectedBarberId ? availability[selectedBarberId] ?? [] : []
  const currentDaySlots = currentDays.find((d) => d.date === selectedDate)?.slots ?? []
  const currentStepIndex = STEP_ORDER.indexOf(step)
  const showStepIndicator = !['summary', 'success'].includes(step)

  // Cargar disponibilidad cuando cambia barbero o servicio
  useEffect(() => {
    if (!selectedBarberId || !selectedServiceId) return

    const service = services.find((s) => s.id === selectedServiceId)
    if (!service) return

    setLoadingAvailability(true)
    setSelectedDate(null)
    setSelectedSlot(null)

    fetch(
      `/api/availability?barberId=${selectedBarberId}&serviceId=${selectedServiceId}&barbershopId=${barbershop.id}`
    )
      .then((r) => r.json())
      .then((data) => {
        setAvailability((prev) => ({ ...prev, [selectedBarberId]: data.days }))
      })
      .catch(() => setError('Error cargando disponibilidad'))
      .finally(() => setLoadingAvailability(false))
  }, [selectedBarberId, selectedServiceId, barbershop.id, services])

  // Cargar disponibilidad básica para todos los barberos (para mostrar en BarberSelector)
  useEffect(() => {
    const firstService = services[0]
    if (!firstService) return

    barbers.forEach((barber) => {
      if (availability[barber.id]) return
      fetch(
        `/api/availability?barberId=${barber.id}&serviceId=${firstService.id}&barbershopId=${barbershop.id}`
      )
        .then((r) => r.json())
        .then((data) => {
          setAvailability((prev) => ({ ...prev, [barber.id]: data.days }))
        })
        .catch(() => {})
    })
  }, [barbers, barbershop.id, services]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const goBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step)
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarberId(barberId)
    setSelectedDate(null)
    setSelectedSlot(null)
    goNext()
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    goNext()
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    goNext()
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    goNext()
  }

  const handleFormSubmit = (data: CustomerFormValues) => {
    setCustomerData(data)
    goNext()
  }

  const handleConfirm = async () => {
    if (!selectedBarberId || !selectedServiceId || !selectedDate || !selectedSlot || !customerData) return

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
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email || undefined,
          },
          start_time: selectedSlot.startTime,
          notes: customerData.notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Error al crear la cita. Por favor intenta de nuevo.')
        return
      }

      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleBookAnother = () => {
    setStep('barber')
    setSelectedBarberId(null)
    setSelectedServiceId(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setCustomerData(null)
    setError(null)
  }

  const canGoBack = step !== 'barber' && step !== 'success'

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header del flujo */}
      <div className="sticky top-0 z-10 bg-bg-primary/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={goBack}
              className="p-2 -ml-2 rounded-xl hover:bg-bg-secondary transition-colors"
            >
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-text-muted">{barbershop.name}</p>
            <p className="text-sm font-semibold text-text-primary leading-tight">
              {step === 'barber' && 'Reserva tu cita'}
              {step === 'service' && `Con ${selectedBarber?.name ?? 'tu barbero'}`}
              {step === 'date' && selectedService?.name}
              {step === 'time' && 'Elige un horario'}
              {step === 'form' && 'Tus datos'}
              {step === 'summary' && 'Confirmar cita'}
              {step === 'success' && '¡Listo!'}
            </p>
          </div>
        </div>

        {showStepIndicator && currentStepIndex >= 0 && currentStepIndex < 5 && (
          <div className="px-4 pb-3 max-w-lg mx-auto">
            <StepIndicator steps={STEPS} currentStep={currentStepIndex} />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Error global */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-400/70 mt-1 underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Pasos */}
        {step === 'barber' && (
          <BarberSelector
            barbers={barbers}
            selectedBarberId={selectedBarberId}
            availability={availability}
            onSelect={handleBarberSelect}
          />
        )}

        {step === 'service' && (
          <ServiceSelector
            services={services}
            selectedServiceId={selectedServiceId}
            onSelect={handleServiceSelect}
          />
        )}

        {step === 'date' && (
          <>
            {loadingAvailability ? (
              <div className="flex flex-col items-center py-20 gap-3">
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
          </>
        )}

        {step === 'time' && selectedDate && (
          <TimeSelector
            slots={currentDaySlots}
            selectedSlot={selectedSlot}
            onSelect={handleSlotSelect}
            serviceName={selectedService?.name}
          />
        )}

        {step === 'form' && (
          <CustomerForm
            defaultValues={customerData ?? undefined}
            onSubmit={handleFormSubmit}
          />
        )}

        {step === 'summary' &&
          selectedBarber &&
          selectedService &&
          selectedDate &&
          selectedSlot &&
          customerData && (
            <BookingSummary
              barbershop={barbershop}
              barber={selectedBarber}
              service={selectedService}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              customerName={customerData.name}
              customerPhone={customerData.phone}
              customerEmail={customerData.email}
              notes={customerData.notes}
              onConfirm={handleConfirm}
              onBack={goBack}
              isLoading={isConfirming}
            />
          )}

        {step === 'success' &&
          selectedBarber &&
          selectedService &&
          selectedDate &&
          selectedSlot &&
          customerData && (
            <BookingSuccess
              barbershop={barbershop}
              barber={selectedBarber}
              service={selectedService}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              customerName={customerData.name}
              onBookAnother={handleBookAnother}
            />
          )}
      </div>
    </div>
  )
}
