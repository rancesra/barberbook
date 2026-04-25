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
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/reservas', label: 'Reservas', icon: Calendar },
  { href: '/admin/barberos', label: 'Barberos', icon: Users },
  { href: '/admin/servicios', label: 'Servicios', icon: Scissors },
  { href: '/admin/horarios', label: 'Horarios', icon: Clock },
  { href: '/admin/suscripciones', label: 'Suscripciones', icon: Crown },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-60 bg-bg-secondary border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
            <Scissors size={16} className="text-gold" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">BarberBook</p>
            <p className="text-text-muted text-xs">Panel Admin</p>
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-red-900/20 transition-colors w-full"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
