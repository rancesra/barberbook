'use client'
import { useEffect, useState } from 'react'
import { PlusCircle, Scissors, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Barber {
  id: string
  name: string
  specialty: string | null
  description: string | null
  photo_url: string | null
  is_active: boolean
  sort_order: number
}

export default function BarberosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await createClient().from('barbers').select('*').order('sort_order')
    setBarbers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a "${name}"? Se eliminarán también sus horarios.`)) return
    const supabase = createClient()
    await supabase.from('barber_working_hours').delete().eq('barber_id', id)
    const { error } = await supabase.from('barbers').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    await load()
  }

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[1,2].map(i => <div key={i} className="h-24 bg-bg-secondary rounded-xl" />)}
      </div>
    </div>
  )

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
        {barbers.map((barber) => (
          <div key={barber.id} className="card p-4 flex items-start gap-4">
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${barber.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-text-muted'}`}>
                  {barber.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-gold text-sm mt-0.5">{barber.specialty}</p>
              {barber.description && (
                <p className="text-text-secondary text-xs mt-1 line-clamp-2">{barber.description}</p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <Link
                href={`/admin/barberos/${barber.id}`}
                className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors"
                title="Editar"
              >
                <Pencil size={15} />
              </Link>
              <button
                onClick={() => handleDelete(barber.id, barber.name)}
                className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {barbers.length === 0 && (
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
