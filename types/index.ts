// ============================================================
// Tipos centrales de BarberBook
// ============================================================

export type AppointmentStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'sync_pending'

export interface Barbershop {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_image_url: string | null
  whatsapp: string | null
  instagram: string | null
  address: string | null
  google_maps_url: string | null
  google_maps_url2: string | null
  timezone: string
  primary_color: string
  accent_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Barber {
  id: string
  barbershop_id: string
  name: string
  slug: string
  photo_url: string | null
  specialty: string | null
  description: string | null
  phone: string | null
  calendar_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  barbershop_id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  barbershop_id: string
  barber_id: string
  service_id: string
  customer_id: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  google_calendar_event_id: string | null
  created_at: string
  updated_at: string
  // Relaciones opcionales
  barber?: Barber
  service?: Service
  customer?: Customer
  barbershop?: Barbershop
}

export interface BarberWorkingHours {
  id: string
  barber_id: string
  day_of_week: number // 0=Dom, 1=Lun, ..., 6=Sab
  start_time: string // HH:MM:SS
  end_time: string
  is_active: boolean
}

export interface BarberBreak {
  id: string
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface BlockedDate {
  id: string
  barber_id: string | null
  barbershop_id: string | null
  date: string // YYYY-MM-DD
  reason: string | null
  created_at: string
}

// ============================================================
// Tipos para el flujo de reserva
// ============================================================

export interface TimeSlot {
  startTime: string // ISO string
  endTime: string
  available: boolean
  label: string // "8:30 AM"
}

export interface DayAvailability {
  date: string // YYYY-MM-DD
  label: string // "Hoy", "Mañana", "Lun 14"
  dayOfWeek: number
  available: boolean
  slotsCount: number
  slots: TimeSlot[]
  status: 'open' | 'few' | 'full' | 'closed' | 'past'
}

export interface BookingFormData {
  barbershopId: string
  barberId: string
  serviceId: string
  selectedDate: string // YYYY-MM-DD
  selectedSlot: TimeSlot
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

export interface CreateAppointmentPayload {
  barbershop_id: string
  barber_id: string
  service_id: string
  customer: {
    name: string
    phone: string
    email?: string
  }
  start_time: string
  notes?: string
}

export interface CreateAppointmentResult {
  success: boolean
  appointment?: Appointment
  error?: string
}

// ============================================================
// Tipos para el panel admin
// ============================================================

export interface DashboardStats {
  todayAppointments: number
  weekAppointments: number
  activeBarbers: number
  activeServices: number
  todayAvailableSlots: number
  appointmentsByBarber: { barber: Barber; count: number }[]
}

export interface AppointmentWithRelations extends Appointment {
  barber: Barber
  service: Service
  customer: Customer
  barbershop: Barbershop
}
