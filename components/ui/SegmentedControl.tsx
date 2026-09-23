'use client'

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}

/**
 * Control segmentado estilo iOS: la píldora se desliza hasta la opción activa.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value))

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="glass relative flex p-1 rounded-full w-full max-w-xs"
    >
      {/* Píldora deslizante */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-full bg-white/15 border border-white/20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
