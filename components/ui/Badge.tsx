import { cn } from '@/lib/utils'

type BadgeVariant = 'available' | 'few' | 'full' | 'closed' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'sync_pending'

const variants: Record<BadgeVariant, string> = {
  available: 'bg-green-900/40 text-green-400',
  few: 'bg-yellow-900/40 text-yellow-400',
  full: 'bg-red-900/30 text-red-400',
  closed: 'bg-gray-800 text-text-muted',
  confirmed: 'bg-green-900/40 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
  completed: 'bg-blue-900/40 text-blue-400',
  no_show: 'bg-orange-900/30 text-orange-400',
  sync_pending: 'bg-yellow-900/40 text-yellow-400',
}

const labels: Record<BadgeVariant, string> = {
  available: 'Disponible',
  few: 'Pocos cupos',
  full: 'Lleno',
  closed: 'Cerrado',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No asistió',
  sync_pending: 'Pendiente sync',
}

interface BadgeProps {
  variant: BadgeVariant
  label?: string
  className?: string
}

export function Badge({ variant, label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-xs font-medium px-2.5 py-0.5 rounded-full inline-block',
        variants[variant],
        className
      )}
    >
      {label ?? labels[variant]}
    </span>
  )
}
