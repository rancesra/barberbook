import type { Metadata } from 'next'
import { BarberNav } from '@/components/barbero/BarberNav'

export const metadata: Metadata = {
  title: 'Mi Panel — Artist Studio',
  manifest: '/manifest-barbero.json',
}

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="pb-20">
        {children}
      </main>
      <BarberNav />
    </div>
  )
}
