import { createAdminClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { PlusCircle, Scissors } from 'lucide-react'
import Link from 'next/link'

export default async function BarberosPage() {
  const supabase = createAdminClient()

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .order('sort_order')

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Barberos</h1>
          <p className="text-text-secondary text-sm mt-1">Gestiona tu equipo</p>
        </div>
        <Link
          href="/admin/barberos/nuevo"
          className="flex items-center gap-2 bg-gold text-bg-primary text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gold-light transition-colors"
        >
          <PlusCircle size={16} />
          Nuevo barbero
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {barbers?.map((barber) => (
          <Link
            key={barber.id}
            href={`/admin/barberos/${barber.id}`}
            className="card p-4 hover:border-border-light transition-colors flex items-start gap-4"
          >
            {barber.photo_url ? (
              <Image
                src={barber.photo_url}
                alt={barber.name}
                width={56}
                height={56}
                className="rounded-xl object-cover w-14 h-14 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                <Scissors size={24} className="text-gold" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary">{barber.name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    barber.is_active
                      ? 'bg-green-900/40 text-green-400'
                      : 'bg-gray-800 text-text-muted'
                  }`}
                >
                  {barber.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-gold text-sm mt-0.5">{barber.specialty}</p>
              {barber.description && (
                <p className="text-text-secondary text-xs mt-1.5 line-clamp-2">
                  {barber.description}
                </p>
              )}
              {barber.calendar_id && (
                <p className="text-text-muted text-xs mt-1.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Google Calendar conectado
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {barbers?.length === 0 && (
        <div className="card p-12 text-center">
          <Scissors size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No hay barberos registrados</p>
          <Link href="/admin/barberos/nuevo" className="text-gold text-sm mt-2 inline-block hover:text-gold-light">
            Agregar el primer barbero →
          </Link>
        </div>
      )}
    </div>
  )
}
