'use client'
import { useEffect, useState, useMemo } from 'react'

const PIECES = 26
const DURATION_MS = 3000

/**
 * Confeti dorado discreto: cae tres segundos y se quita del DOM.
 * Son divs con transform/opacity (baratos de animar), no canvas.
 */
export function GoldConfetti() {
  const [visible, setVisible] = useState(true)

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.1,
        size: 5 + Math.random() * 5,
        rotate: Math.random() * 360,
        gold: Math.random() > 0.45,
      })),
    []
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false)
      return
    }
    const timer = window.setTimeout(() => setVisible(false), DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-16px] block rounded-[2px] confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.8,
            backgroundColor: p.gold ? '#E2C47A' : '#C9A84C',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
