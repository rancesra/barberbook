'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const RECEDE_CLASS = 'ios-page-recede'
/** Arranque corto: la navegación va en paralelo, no después. */
const DELAY_MS = 90

interface SheetLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

/**
 * Enlace que presenta la pantalla destino como una hoja modal de iOS:
 * la pantalla actual se va hacia atrás y la nueva sube desde abajo.
 * La clase que encoge la página la limpia SheetPage al montarse.
 */
export function SheetLink({ href, className, children }: SheetLinkProps) {
  const router = useRouter()

  // Precargar el destino: sin esto la animación termina y toca esperar
  // a que Next traiga la pantalla, que es lo que se siente como tirón.
  useEffect(() => {
    router.prefetch(href)
  }, [router, href])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Dejar intactos los clics para abrir en otra pestaña
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    e.preventDefault()
    document.body.classList.add(RECEDE_CLASS)

    // Esperamos un fotograma para que el navegador pinte el primer paso de
    // la animación antes de empezar a cargar la pantalla nueva.
    requestAnimationFrame(() => {
      window.setTimeout(() => router.push(href), DELAY_MS)
    })
  }

  return (
    <Link href={href} onClick={handleClick} className={className} prefetch>
      {children}
    </Link>
  )
}
