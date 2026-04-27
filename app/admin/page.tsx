export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth } from 'date-fns'
import { Calendar, Users, Scissors, Clock, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import type { AppointmentStatus } from '@/types'

async function getDashboardData() {
  const supabase = createAdminClient()
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString()
  const monthStart = startOfMonth(now).toISOString()

  const [todayRes, weekRes, barbersRes, servicesRes, upcomingRes, earnedTodayRes, earnedMonthRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd)
      .neq('status', 'cancelled'),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .gte('start_time', weekStart)
      .lte('start_time', weekEnd)
      .neq('status', 'cancelled'),
    supabase.from('barbers').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('services').select('id', { count: 'exact' }).eq('is_active', true),
    supabase
      .from('appointments')
      .select('*, barber:barbers(name), service:services(name), customer:customers(name, phone)')
      .gte('start_time', now.toISOString())
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true })
      .limit(8),
    // Ganado hoy: citas ya pasadas hoy (start_time <= now) y no canceladas
    supabase
      .from('appointments')
      .select('service:services(price)')
      .gte('start_time', todayStart)
      .lte('start_time', now.toISOString())
      .neq('status', 'cancelled'),
    // Ganado este mes: citas ya pasadas en el mes y no canceladas
    supabase
      .from('appointments')
      .select('service:services(price)')
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
    todayCount: todayRes.count ?? 0,
    weekCount: weekRes.count ?? 0,
    activeBarbers: barbersRes.count ?? 0,
    activeServices: servicesRes.count ?? 0,
    upcoming: upcomingRes.data ?? [],
    earnedToday: sumPrices(earnedTodayRes.data),
    earnedMonth: sumPrices(earnedMonthRes.data),
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

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Citas de hoy"
          value={data.todayCount}
          icon={<Calendar size={20} />}
          href="/admin/reservas"
        />
        <StatCard
          label="Esta semana"
          value={data.weekCount}
          icon={<TrendingUp size={20} />}
          sub="citas confirmadas"
        />
        <StatCard
          label="Barberos activos"
          value={data.activeBarbers}
          icon={<Users size={20} />}
          href="/admin/barberos"
        />
        <StatCard
          label="Servicios"
          value={data.activeServices}
          icon={<Scissors size={20} />}
          href="/admin/servicios"
        />
      </div>

      {/* Ingresos */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Ganado hoy"
          value={formatPrice(data.earnedToday)}
          icon={<DollarSign size={20} />}
          sub="citas completadas hoy"
        />
        <StatCard
          label="Ganado este mes"
          value={formatPrice(data.earnedMonth)}
          icon={<DollarSign size={20} />}
          sub="citas completadas en el mes"
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

        {data.upcoming.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Clock size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No hay citas próximas</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.upcoming.map((appt: Record<string, unknown>) => (
              <Link
                key={appt.id as string}
                href={`/admin/reservas?id=${appt.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-secondary/50 transition-colors"
              >
                <div className="flex-shrink-0 text-center w-14">
                  <p className="text-gold text-sm font-bold">
                    {format(new Date(appt.start_time as string), 'h:mm')}
                  </p>
                  <p className="text-text-muted text-xs">
                    {format(new Date(appt.start_time as string), 'a').toLowerCase()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {(appt.customer as Record<string, string>)?.name}
                  </p>
                  <p className="text-text-muted text-xs truncate">
                    {(appt.barber as Record<string, string>)?.name} · {(appt.service as Record<string, string>)?.name}
                  </p>
                </div>
                <Badge variant={appt.status as AppointmentStatus} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
