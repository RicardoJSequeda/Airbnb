import { guestAccessOptions } from './data'

interface GuestAccessStepProps {
  selectedAccessId: string | null
  onSelect: (id: string) => void
}

export function GuestAccessStep({ selectedAccessId, onSelect }: GuestAccessStepProps) {
  return (
    <section className="max-w-[800px] mx-auto px-3 sm:px-4 py-3">
      <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-4 max-w-[560px]">
        ¿De qué tipo de alojamiento dispondrán los huéspedes?
      </h2>

      <div className="space-y-2 sm:space-y-2.5 pb-4">
        {guestAccessOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedAccessId === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 sm:py-3.5 flex items-center justify-between gap-4 transition ${
                isSelected
                  ? 'border-[#222222] bg-white shadow-[0_0_0_2px_#222222]'
                  : 'border-[#D2D2D2] bg-[#F7F7F7] hover:border-[#7A7A7A]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-medium text-[#222222]">{option.title}</h3>
                <p className="text-sm text-[#5D5D5D] mt-1 leading-snug max-w-[520px]">
                  {option.description}
                </p>
              </div>
              <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-[#222222] flex-shrink-0" strokeWidth={1.8} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
