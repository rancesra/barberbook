'use client'
import { useEffect, useState } from 'react'

/**
 * Envoltura de la pantalla que se presenta como hoja modal: sube desde abajo
 * y, al montarse, quita el encogido que SheetLink dejó en la página anterior.
 */
export function SheetPage({ children }: { children: React.ReactNode }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Solo animamos si venimos de un SheetLink; si se entró directo por URL,
    // la pantalla aparece sin transición.
    const cameFromSheet = document.body.classList.contains('ios-page-recede')
    if (cameFromSheet) {
      setAnimate(true)
      document.body.classList.remove('ios-page-recede')
    }
  }, [])

  return <div className={animate ? 'ios-modal-in' : undefined}>{children}</div>
}
