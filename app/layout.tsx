import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Barbería Artist Studio — Reserva tu cita',
  description: 'Reserva tu cita en Barbería Artist Studio. Rápido, fácil y desde tu celular.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Barbería Artist Studio — Reserva tu cita',
    description: 'Reserva tu cita en Barbería Artist Studio. Rápido, fácil y desde tu celular.',
    url: 'https://barberartist.vercel.app',
    siteName: 'Barbería Artist Studio',
    images: [{ url: '/logo.jpg', width: 512, height: 512 }],
    locale: 'es_CO',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0E0E0E',
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
