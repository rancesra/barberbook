'use client'
import { useEffect, useState } from 'react'
import { PlusCircle, Clock, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDuration, formatPrice } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  sort_order: number
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('services').select('*').order('sort_order')
    setServices(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el servicio "${name}"?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

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
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-secondary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">{service.name}</p>
                  {!service.is_active && (
                    <span className="text-xs bg-gray-800 text-text-muted px-2 py-0.5 rounded-full">Inactivo</span>
                  )}
                </div>
                {service.description && (
                  <p className="text-text-secondary text-sm mt-0.5 line-clamp-1">{service.description}</p>
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

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/servicios/${service.id}`}
                    className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {services.length === 0 && (
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
