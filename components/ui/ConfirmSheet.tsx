'use client'
import { useEffect, useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  destructive?: boolean
}

interface ConfirmSheetProps extends ConfirmOptions {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Hoja de confirmación estilo iOS, en vez del confirm() gris del navegador.
 */
export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Cancelar"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 ios-fade"
      />

      <div className="ios-sheet relative w-full max-w-md p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="glass-dark rounded-[28px] overflow-hidden">
          <div className="px-6 pt-6 pb-5 text-center">
            <p className="text-base font-semibold text-text-primary">{title}</p>
            {message && (
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{message}</p>
            )}
          </div>
          <button
            onClick={onConfirm}
            className={`w-full h-14 text-[17px] font-semibold border-t border-white/10 transition-colors ${
              destructive ? 'text-red-400 hover:bg-red-500/10' : 'text-gold hover:bg-white/5'
            }`}
          >
            {confirmLabel}
          </button>
        </div>

        <button
          onClick={onCancel}
          className="glass-dark w-full h-14 mt-2 rounded-[22px] text-[17px] font-semibold text-text-primary ios-press"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

/**
 * Manejo del estado de la hoja: abre, guarda la acción pendiente y la ejecuta
 * al confirmar. Reemplaza a window.confirm().
 */
export function useConfirm() {
  const [state, setState] = useState<{
    options: ConfirmOptions
    action: () => void
  } | null>(null)

  const confirm = useCallback((options: ConfirmOptions, action: () => void) => {
    setState({ options, action })
  }, [])

  const close = useCallback(() => setState(null), [])

  const sheet = (
    <ConfirmSheet
      open={state !== null}
      title={state?.options.title ?? ''}
      message={state?.options.message}
      confirmLabel={state?.options.confirmLabel}
      destructive={state?.options.destructive}
      onConfirm={() => {
        state?.action()
        close()
      }}
      onCancel={close}
    />
  )

  return { confirm, sheet }
}
