import { createAdminClient } from '@/lib/supabase/server'
import { PlusCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDuration, formatPrice } from '@/lib/utils'

export default async function ServiciosPage() {
  const supabase = createAdminClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('sort_order')

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Servicios</h1>
          <p className="text-text-secondary text-sm mt-1">Gestiona lo que ofreces</p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="flex items-center gap-2 bg-gold text-bg-primary text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gold-light transition-colors"
        >
          <PlusCircle size={16} />
          Nuevo servicio
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-border">
          {services?.map((service) => (
            <Link
              key={service.id}
              href={`/admin/servicios/${service.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">{service.name}</p>
                  {!service.is_active && (
                    <span className="text-xs bg-gray-800 text-text-muted px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-text-secondary text-sm mt-0.5 line-clamp-1">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-text-muted text-sm">
                    <Clock size={12} />
                    {formatDuration(service.duration_minutes)}
                  </div>
                  {service.price !== null && (
                    <p className="text-gold font-bold">{formatPrice(service.price)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {services?.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">No hay servicios registrados</p>
          <Link href="/admin/servicios/nuevo" className="text-gold text-sm mt-2 inline-block hover:text-gold-light">
            Agregar primer servicio →
          </Link>
        </div>
      )}
    </div>
  )
}
