'use client'
import { useState, useRef } from 'react'
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
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartY = useRef(0)

  const closeMore = () => {
    setMoreOpen(false)
    setDragY(0)
  }

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
      <aside className="glass hidden md:flex w-60 m-3 rounded-3xl min-h-[calc(100vh-1.5rem)] flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
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
                    ? 'bg-gold/15 border border-gold/25 text-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
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
        <div className="p-3 border-t border-white/10">
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
      <nav className="glass-dark md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-3 right-3 z-50 rounded-full flex items-center justify-around px-2 h-16">
        {MOBILE_PRIMARY.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-[56px] h-[50px] rounded-full transition-colors',
                active
                  ? 'text-gold bg-gold/15 border border-gold/25'
                  : 'text-white/70 hover:text-white'
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
            'flex flex-col items-center justify-center gap-0.5 w-[56px] h-[50px] rounded-full transition-colors',
            isMoreActive
              ? 'text-gold bg-gold/15 border border-gold/25'
              : 'text-white/70 hover:text-white'
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
            className="absolute inset-0 bg-black/60 ios-fade"
            style={{ opacity: Math.max(0, 1 - dragY / 260) }}
            onClick={closeMore}
          />
          <div
            className={`glass-dark absolute bottom-0 left-0 right-0 rounded-t-[28px] p-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] ${dragging || dragY > 0 ? '' : 'ios-sheet'}`}
            style={{
              transform: `translateY(${dragY}px)`,
              transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            {/* Tirador: arrastra hacia abajo para cerrar */}
            <div
              onPointerDown={(e) => {
                dragStartY.current = e.clientY
                setDragging(true)
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (!dragging) return
                setDragY(Math.max(0, e.clientY - dragStartY.current))
              }}
              onPointerUp={() => {
                setDragging(false)
                if (dragY > 90) closeMore()
                else setDragY(0)
              }}
              className="py-2 -mt-1 mb-1 cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />
            </div>
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-white/10">
              <p className="text-sm font-semibold text-text-primary">Más opciones</p>
              <button onClick={closeMore} aria-label="Cerrar" className="p-1 text-white/60">
                <X size={18} />
              </button>
            </div>
            {MOBILE_MORE.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMore}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-colors ios-press',
                    active ? 'bg-gold/15 border border-gold/25 text-gold' : 'text-text-secondary hover:bg-white/5'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-400 w-full hover:bg-red-500/10 transition-colors ios-press"
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
