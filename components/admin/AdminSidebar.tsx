'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  BarChart2,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin',               label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/admin/reservas',      label: 'Reservas',      icon: Calendar },
  { href: '/admin/servicios',     label: 'Servicios',     icon: Scissors },
  { href: '/admin/horarios',      label: 'Horarios',      icon: Clock },
  { href: '/admin/suscripciones', label: 'Suscripciones', icon: Crown },
  { href: '/admin/reportes',      label: 'Reportes',      icon: BarChart2 },
  { href: '/admin/barberos',      label: 'Barberos',      icon: Users },
  { href: '/admin/configuracion', label: 'Config',        icon: Settings },
]

// Nav móvil: lo que se revisa a diario va directo en la barra.
// Lo que se configura una vez y ya (Servicios, Horarios, Barberos, Config) va en "Más".
const MOBILE_PRIMARY = NAV_ITEMS.filter((item) =>
  ['/admin', '/admin/reservas', '/admin/suscripciones', '/admin/reportes'].includes(item.href)
)
const MOBILE_MORE = NAV_ITEMS.filter((item) => !MOBILE_PRIMARY.includes(item))

export function AdminSidebar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const isMoreActive = MOBILE_MORE.some(isActive)

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

        {/* Nav */}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border flex items-center justify-around px-1 h-16 pb-[env(safe-area-inset-bottom)]">
        {MOBILE_PRIMARY.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors min-w-[44px]',
                active ? 'text-gold' : 'text-text-muted'
              )}
            >
              <item.icon size={19} />
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors min-w-[44px]',
            isMoreActive ? 'text-gold' : 'text-text-muted'
          )}
        >
          <MoreHorizontal size={19} />
          <span className="text-[9px] font-medium leading-tight">Más</span>
        </button>
      </nav>

      {/* ── Hoja "Más" móvil ── */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-border rounded-t-2xl p-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-border">
              <p className="text-sm font-semibold text-text-primary">Más opciones</p>
              <button onClick={() => setMoreOpen(false)} className="p-1 text-text-muted">
                <X size={18} />
              </button>
            </div>
            {MOBILE_MORE.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    active ? 'bg-gold/10 text-gold' : 'text-text-secondary'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 w-full"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  )
}
