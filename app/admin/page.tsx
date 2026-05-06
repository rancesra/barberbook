export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import { Calendar, TrendingUp, DollarSign, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { UpcomingAppointments } from '@/components/admin/UpcomingAppointments'

const TZ = 'America/Bogota'

async function getDashboardData() {
  const supabase = createAdminClient()
  const now = new Date()
  // Calcular inicio/fin del día en hora Colombia para evitar desfase UTC
  const nowInTz = toZonedTime(now, TZ)
  const todayStart = fromZonedTime(startOfDay(nowInTz), TZ).toISOString()
  const todayEnd   = fromZonedTime(endOfDay(nowInTz), TZ).toISOString()
  const weekStart  = fromZonedTime(startOfWeek(nowInTz, { weekStartsOn: 1 }), TZ).toISOString()
  const weekEnd    = fromZonedTime(endOfWeek(nowInTz, { weekStartsOn: 1 }), TZ).toISOString()
  const monthStart = fromZonedTime(startOfMonth(nowInTz), TZ).toISOString()

  // Obtener el barbero principal y la barbería
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')
    .limit(1)
    .single()

  if (!barber) return null

  const bid = barber.id

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('google_maps_url')
    .limit(1)
    .single()

  const [todayRes, weekRes, servicesRes, upcomingRes, earnedTodayRes, earnedMonthRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('barber_id', bid)
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd)
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('barber_id', bid)
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd)
      .neq('status', 'cancelled'),
    supabase.from('services').select('id', { count: 'exact' }).eq('is_active', true),
    supabase
      .from('appointments')
      .select('*, service:services(name), customer:customers(name, phone)')
      .eq('barber_id', bid)
      .gte('start_time', now.toISOString())
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true })
      .limit(8),
    supabase
      .from('appointments')
      .select('service:services(price)')
      .eq('barber_id', bid)
      .gte('start_time', todayStart)
      .lte('start_time', now.toISOString())
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('service:services(price)')
      .eq('barber_id', bid)
      .gte('start_time', monthStart)
      .lte('start_time', now.toISOString())
      .neq('status', 'cancelled'),
  ])

  const sumPrices = (data: unknown[] | null): number => {
    if (!data) return 0
    return data.reduce((acc: number, row: unknown) => {
      const r = row as { service?: { price?: number } | null }
      return acc + (r.service?.price ?? 0)
    }, 0)
  }

  return {
    barberName: barber.name,
    todayCount: todayRes.count ?? 0,
    weekCount: weekRes.count ?? 0,
    activeServices: servicesRes.count ?? 0,
    upcoming: upcomingRes.data ?? [],
    earnedToday: sumPrices(earnedTodayRes.data),
    earnedMonth: sumPrices(earnedMonthRes.data),
    mapsUrl: barbershop?.google_maps_url ?? null,
  }
}

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  sub?: string
  href?: string
}

function StatCard({ label, value, icon, sub, href }: StatCardProps) {
  const content = (
    <div className="card p-5 hover:border-border-light transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-text-muted text-xs mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
          {icon}
        </div>
      </div>
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">No hay barbero configurado.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Hola, {data.barberName} 👋</h1>
          <p className="text-text-secondary text-sm mt-1 capitalize">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <Link
          href="/agendar?from=admin"
          className="flex items-center gap-2 bg-gold text-bg-primary text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} />
          Nueva cita
        </Link>
      </div>

      {/* Stats citas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Citas hoy"
          value={data.todayCount}
          icon={<Calendar size={20} />}
          href="/admin/reservas"
        />
        <StatCard
          label="Esta semana"
          value={data.weekCount}
          icon={<TrendingUp size={20} />}
          sub="citas agendadas"
        />
      </div>

      {/* Stats ingresos */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Ganado hoy"
          value={formatPrice(data.earnedToday)}
          icon={<DollarSign size={20} />}
          sub="citas ya pasadas"
        />
        <StatCard
          label="Ganado este mes"
          value={formatPrice(data.earnedMonth)}
          icon={<DollarSign size={20} />}
          sub="citas ya pasadas"
        />
      </div>

      {/* Próximas citas */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">Próximas citas</h2>
          <Link href="/admin/reservas" className="text-gold text-sm font-medium hover:text-gold-light">
            Ver todas →
          </Link>
        </div>

        <UpcomingAppointments appointments={data.upcoming as any} mapsUrl={data.mapsUrl} />
      </div>

    </div>
  )
}
