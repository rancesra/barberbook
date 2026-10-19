'use client'
import { useEffect, useState } from 'react'
import { PlusCircle, Clock, Pencil, Trash2, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useConfirm } from '@/components/ui/ConfirmSheet'
import { formatDuration, formatPrice } from '@/lib/utils'
import { deleteSheetFor } from '@/lib/service-delete'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  sort_order: number
  /** Citas en el historial (pasadas, futuras y canceladas) */
  appointments: number
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const { confirm, sheet } = useConfirm()

  const load = async () => {
    const res = await fetch('/api/admin/services')
    const result = await res.json().catch(() => ({}))
    if (res.ok) setServices(result.services)
    else setError(result.error ?? 'No se pudieron cargar los servicios')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = (service: Service) => {
    confirm(deleteSheetFor(service), async () => {
      setError(null)
      setNotice(null)
      const res = await fetch(`/api/admin/services/${service.id}`, { method: 'DELETE' })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(result.error ?? 'No se pudo eliminar el servicio. Intenta de nuevo.')
        return
      }
      if (result.archived) {
        setNotice(`"${service.name}" quedó oculto. Sus citas e ingresos siguen en el historial.`)
      }
      await load()
    })
  }

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-3xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl ios-push">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Servicios</h1>
          <p className="text-text-secondary text-sm mt-1">Gestiona lo que ofreces</p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="glass-gold flex items-center gap-2 text-bg-primary text-sm font-semibold py-2.5 px-4 rounded-full hover:brightness-110 transition-all ios-press"
        >
          <PlusCircle size={16} />
          Nuevo servicio
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-2xl" role="alert">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 glass rounded-2xl" role="status">
          <p className="text-text-secondary text-sm">{notice}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="divide-y divide-white/10">
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-semibold ${service.is_active ? 'text-text-primary' : 'text-text-muted'}`}>{service.name}</p>
                  {!service.is_active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-muted">
                      <EyeOff size={10} />
                      Oculto
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-text-secondary text-sm mt-0.5 line-clamp-1">{service.description}</p>
                )}
                <p className="text-text-muted text-xs mt-0.5">
                  {service.appointments === 0
                    ? 'Sin citas'
                    : `${service.appointments.toLocaleString('es-CO')} ${service.appointments === 1 ? 'cita' : 'citas'} en el historial`}
                </p>
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
                  {service.is_active || service.appointments === 0 ? (
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      title={service.appointments > 0 ? 'Ocultar' : 'Eliminar'}
                      aria-label={`${service.appointments > 0 ? 'Ocultar' : 'Eliminar'} ${service.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    // Ya está oculto y tiene historial: no hay nada más que borrar
                    <span className="w-[31px]" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {services.length === 0 && !error && (
        <div className="card p-12 text-center">
          <p className="text-text-secondary">No hay servicios registrados</p>
          <Link href="/admin/servicios/nuevo" className="text-gold text-sm mt-2 inline-block hover:text-gold-light">
            Agregar primer servicio →
          </Link>
        </div>
      )}

      {sheet}
    </div>
  )
}
