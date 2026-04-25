import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BarberBook — Reserva tu cita',
  description: 'Reserva tu cita en tu barbería favorita. Rápido, fácil y desde tu celular.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0E0E0E',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
