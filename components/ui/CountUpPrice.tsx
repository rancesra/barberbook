'use client'
import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface CountUpPriceProps {
  value: number
  durationMs?: number
  className?: string
}

/**
 * El precio sube desde cero hasta su valor. Se detiene en el valor exacto,
 * nunca muestra un número mayor al real.
 */
export function CountUpPrice({ value, durationMs = 600, className }: CountUpPriceProps) {
  const [display, setDisplay] = useState(value)
  const frame = useRef<number>()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      // Desacelera al final, como el resto de las animaciones
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [value, durationMs])

  return <span className={className}>{formatPrice(display)}</span>
}
