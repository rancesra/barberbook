'use client'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/** Interruptor estilo iOS. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full flex-shrink-0 transition-colors duration-200 ${
        checked ? 'bg-gold' : 'bg-white/15'
      }`}
    >
      {/* left-0 explícito: sin él la bolita arranca centrada y se sale del borde */}
      <span
        className={`absolute top-1 left-0 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
