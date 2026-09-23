import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: 'Artist Studio — Panel',
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Artist Panel',
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary bg-[radial-gradient(110%_55%_at_50%_0%,rgba(201,168,76,0.16)_0%,rgba(14,14,14,0)_60%)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pt-[env(safe-area-inset-top)] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  )
}
