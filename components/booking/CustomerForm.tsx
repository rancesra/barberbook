'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'

export interface CustomerFormValues {
  name: string
  phone: string
  notes: string
}

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>
  onSubmit: (data: CustomerFormValues) => void
  isLoading?: boolean
}

export function CustomerForm({ defaultValues, onSubmit, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({ defaultValues })

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).some(k => defaultValues[k as keyof typeof defaultValues])) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="animate-slide-up">
      <h2 className="text-xl font-bold text-text-primary mb-1">Confirma tus datos</h2>
      <p className="text-text-secondary text-sm mb-6">Solo necesitamos lo básico</p>

      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div>
          <label className="label">Nombre completo *</label>
          <input
            type="text"
            placeholder="Tu nombre"
            autoComplete="name"
            className="input-field"
            {...register('name', {
              required: 'El nombre es obligatorio',
              minLength: { value: 2, message: 'Nombre muy corto' },
            })}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="label">Teléfono / WhatsApp *</label>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-sm bg-bg-tertiary border border-border rounded-xl px-3 py-2.5 flex-shrink-0">+57</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="3156669991"
              autoComplete="tel"
              className="input-field flex-1"
              {...register('phone', {
                required: 'El teléfono es obligatorio',
                pattern: { value: /^\d{10}$/, message: 'Debe tener exactamente 10 dígitos' },
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                },
              })}
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Nota (opcional) */}
        <div>
          <label className="label">
            Nota para el barbero{' '}
            <span className="text-text-muted font-normal">(opcional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ej: Quiero un fade bajo con diseño en el lado..."
            className="input-field resize-none"
            {...register('notes')}
          />
        </div>

        <Button type="submit" loading={isLoading} fullWidth className="mt-2">
          Confirmar cita
        </Button>
      </div>
    </form>
  )
}
