import type { SupabaseClient } from '@supabase/supabase-js'

export type ReservasTab = 'upcoming' | 'past' | 'all'

/** Citas por página en Reservas. */
export const PAGE_SIZE = 30

export const APPOINTMENT_FIELDS =
  'id, start_time, status, notes, cancellation_code, service:services(name, duration_minutes), customer:customers(name, phone)'

export interface PageRequest {
  barberId: string
  tab: ReservasTab
  /** 'all' o un estado (confirmed, cancelled...) */
  status: string
  offset: number
  now: Date
}

export interface Page<T> {
  items: T[]
  /** Cuántas citas hay en total con esta pestaña y este filtro. */
  total: number
  error: string | null
}

/**
 * Una página de reservas para el panel. La pestaña, el filtro de estado y el
 * orden los resuelve la base de datos, así el filtro busca entre todas las
 * citas y no solo entre las que ya están cargadas en el celular.
 */
export async function fetchAppointmentsPage<T>(
  supabase: SupabaseClient,
  req: PageRequest
): Promise<Page<T>> {
  const nowIso = req.now.toISOString()

  let query = supabase
    .from('appointments')
    .select(APPOINTMENT_FIELDS, { count: 'exact' })
    .eq('barber_id', req.barberId)

  if (req.tab === 'upcoming') query = query.gte('start_time', nowIso)
  if (req.tab === 'past') query = query.lt('start_time', nowIso)
  if (req.status !== 'all') query = query.eq('status', req.status)

  // Próximas: de la más cercana a la más lejana.
  // Pasadas y todas: de la más reciente hacia atrás.
  const { data, count, error } = await query
    .order('start_time', { ascending: req.tab === 'upcoming' })
    .range(req.offset, req.offset + PAGE_SIZE - 1)

  return {
    items: (data ?? []) as T[],
    total: count ?? 0,
    error: error ? 'No se pudieron cargar las reservas. Intenta de nuevo.' : null,
  }
}
