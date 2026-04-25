'use client'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-gold text-bg-primary hover:bg-gold-light',
    secondary: 'bg-bg-secondary text-text-primary border border-border hover:border-border-light',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-500',
    whatsapp: 'bg-whatsapp text-white hover:bg-green-500',
  }

  const sizes = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3.5 px-6',
    lg: 'text-lg py-4 px-8',
  }

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
