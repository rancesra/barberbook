'use client'
import { useEffect, useState } from 'react'

interface LargeTitleProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

/**
 * Título grande que se encoge y se convierte en barra compacta al hacer
 * scroll, como las pantallas nativas de iOS.
 */
export function LargeTitle({ title, subtitle, action }: LargeTitleProps) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const scroller = document.querySelector('main') ?? window
    const read = () =>
      scroller === window
        ? window.scrollY
        : (scroller as HTMLElement).scrollTop

    const onScroll = () => setCompact(read() > 36)
    onScroll()

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Barra compacta que aparece al bajar */}
      <div
        className={`glass-dark sticky top-[calc(env(safe-area-inset-top)+8px)] z-20 mx-0 rounded-full px-5 h-12 flex items-center justify-between gap-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          compact ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'
        }`}
      >
        <span className="text-sm font-semibold text-text-primary truncate">{title}</span>
        {action}
      </div>

      {/* Título grande */}
      <div
        className={`flex items-start justify-between gap-4 flex-wrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          compact ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
        }`}
      >
        <div>
          <h1 className="text-[32px] leading-tight font-bold text-text-primary tracking-tight">{title}</h1>
          {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
    </>
  )
}
