'use client'
import { useRef, useState } from 'react'

interface SwipeAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'destructive'
}

interface SwipeableRowProps {
  actions: SwipeAction[]
  children: React.ReactNode
}

const ACTION_WIDTH = 78

/**
 * Fila que se desliza a la izquierda para revelar acciones, como en iOS.
 * Funciona con dedo y con mouse; las acciones siguen siendo botones reales,
 * así que también se alcanzan con teclado cuando la fila está abierta.
 */
export function SwipeableRow({ actions, children }: SwipeableRowProps) {
  const maxOffset = actions.length * ACTION_WIDTH
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const moved = useRef(false)

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX
    startOffset.current = offset
    moved.current = false
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const delta = startX.current - e.clientX
    if (Math.abs(delta) > 4) moved.current = true
    const next = Math.min(maxOffset, Math.max(0, startOffset.current + delta))
    setOffset(next)
  }

  const endDrag = () => {
    if (!dragging) return
    setDragging(false)
    setOffset((current) => (current > maxOffset * 0.4 ? maxOffset : 0))
  }

  const close = () => setOffset(0)

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Acciones detrás */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              close()
              action.onClick()
            }}
            style={{ width: ACTION_WIDTH }}
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
              action.variant === 'destructive'
                ? 'bg-red-600/85 text-white hover:bg-red-500'
                : 'bg-white/15 text-text-primary hover:bg-white/25'
            }`}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Contenido deslizable */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          // Si venía de un arrastre, o está abierta, el toque solo cierra
          if (moved.current || offset > 0) {
            e.preventDefault()
            e.stopPropagation()
            close()
          }
        }}
        style={{
          transform: `translateX(-${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          touchAction: 'pan-y',
        }}
        className="relative"
      >
        {children}
      </div>
    </div>
  )
}
