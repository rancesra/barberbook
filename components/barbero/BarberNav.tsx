'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, Clock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/barbero',         label: 'Mis citas',  icon: Calendar, exact: true },
  { href: '/barbero/horario', label: 'Mi horario', icon: Clock },
]

export function BarberNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/barbero/login')
  }

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border flex items-center justify-around px-2 h-16">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
              active ? 'text-gold' : 'text-text-muted'
            )}
          >
            <item.icon size={22} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        )
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-text-muted hover:text-red-400 transition-colors"
      >
        <LogOut size={22} />
        <span className="text-[11px] font-medium">Salir</span>
      </button>
    </nav>
  )
}
