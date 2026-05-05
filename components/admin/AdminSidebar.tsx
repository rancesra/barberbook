'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/admin/reservas',     label: 'Reservas',      icon: Calendar },
  { href: '/admin/servicios',    label: 'Servicios',     icon: Scissors },
  { href: '/admin/horarios',     label: 'Horarios',      icon: Clock },
  { href: '/admin/suscripciones',label: 'Suscripciones', icon: Crown },
  { href: '/admin/barberos',     label: 'Barberos',      icon: Users },
  { href: '/admin/configuracion',label: 'Config',        icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex w-60 bg-bg-secondary border-r border-border min-h-screen flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
              <Scissors size={16} className="text-gold" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-sm">Artist Studio</p>
              <p className="text-text-muted text-xs">Panel</p>
            </div>
          </div>
        </div>

        {/* Nav — usa Link para prefetch automático (navegación instantánea) */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-gold/10 text-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )}
              >
                <item.icon size={17} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-900/20 transition-colors w-full"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Bottom nav móvil ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border flex items-center justify-around px-1 h-16">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-[48px]',
                active ? 'text-gold' : 'text-text-muted'
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
        {/* Logout en móvil */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-text-muted hover:text-red-400 transition-colors min-w-[48px]"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>
    </>
  )
}
