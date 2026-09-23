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
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'glass-gold text-bg-primary hover:brightness-110',
    secondary: 'glass text-text-primary hover:bg-white/10',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
    danger: 'bg-red-600/90 text-white border border-red-400/30 hover:bg-red-500',
    whatsapp: 'bg-whatsapp/90 text-white border border-white/20 hover:bg-whatsapp',
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
