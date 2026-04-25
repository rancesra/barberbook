import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(isoString: string, tz?: string): string {
  return format(parseISO(isoString), "EEEE d 'de' MMMM, yyyy", { locale: es })
}

export function formatTime(isoString: string): string {
  return format(parseISO(isoString), 'h:mm a').replace('AM', 'am').replace('PM', 'pm')
}

export function formatPhone(phone: string): string {
  return phone.replace(/\s/g, '').replace(/[^0-9+]/g, '')
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = formatPhone(phone)
  return `https://wa.me/${clean.replace('+', '')}?text=${encodeURIComponent(message)}`
}

export function buildBookingWhatsAppMessage(params: {
  customerName: string
  barberName: string
  serviceName: string
  date: string
  time: string
  barbershopName: string
}): string {
  return `Hola, soy ${params.customerName}. Confirmo mi cita en ${params.barbershopName} con ${params.barberName} para el día ${params.date} a las ${params.time}. Servicio: ${params.serviceName}.`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatPrice(price: number | null): string {
  if (price === null) return ''
  return `$${price.toFixed(0)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}
