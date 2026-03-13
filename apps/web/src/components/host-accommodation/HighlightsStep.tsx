'use client'

const HIGHLIGHT_OPTIONS = [
  'Tranquilo',
  'Excepcional',
  'Ideal para familias',
  'Elegante',
  'Central',
  'Espacioso',
] as const

interface HighlightsStepProps {
  selected: string[]
  onChange: (next: string[]) => void
}

export function HighlightsStep({ selected, onChange }: HighlightsStepProps) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((l) => l !== label))
      return
    }
    if (selected.length >= 2) return
    onChange([...selected, label])
  }

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-3">
        Ahora describamos tu casa
      </h2>
      <p className="text-sm text-[#717171] mb-6 max-w-[520px]">
        Elige hasta 2 aspectos destacados. Los usaremos para comenzar tu descripción.
      </p>

      <div className="flex flex-wrap gap-3">
        {HIGHLIGHT_OPTIONS.map((label) => {
          const isActive = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                isActive
                  ? 'border-[#222222] bg-[#222222] text-white'
                  : 'border-[#DDDDDD] bg-white text-[#222222] hover:border-[#B0B0B0]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

