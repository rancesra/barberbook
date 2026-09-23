import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

// next/font las descarga en build y las sirve desde nuestro dominio, con
// <link rel="preload">. Así el navegador no tiene que ir a Google en medio
// del primer pintado, que era lo que trababa la carga.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Barbería Artist Studio — Reserva tu cita',
  description: 'Reserva tu cita en Barbería Artist Studio. Rápido, fácil y desde tu celular.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    title: 'Barbería Artist Studio — Reserva tu cita',
    description: 'Reserva tu cita en Barbería Artist Studio. Rápido, fácil y desde tu celular.',
    url: 'https://barberartist.vercel.app',
    siteName: 'Barbería Artist Studio',
    images: [{ url: '/logo.webp', width: 512, height: 512 }],
    locale: 'es_CO',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0E0E0E',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  )
}
