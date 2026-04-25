import { AdminSidebar } from '@/components/admin/AdminSidebar'

// La protección de rutas la maneja el middleware.ts
// El layout solo agrega la estructura visual del panel admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
