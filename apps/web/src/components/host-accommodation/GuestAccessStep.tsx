import { guestAccessOptions } from './data'

interface GuestAccessStepProps {
  selectedAccessId: string | null
  onSelect: (id: string) => void
}

export function GuestAccessStep({ selectedAccessId, onSelect }: GuestAccessStepProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-6">
      <h2 className="text-5xl lg:text-6xl leading-[1.05] font-semibold text-[#222222] mb-10 max-w-[1020px]">
        ¿De qué tipo de alojamiento dispondrán los huéspedes?
      </h2>

      <div className="space-y-4 pb-10">
        {guestAccessOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedAccessId === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`w-full text-left rounded-2xl border px-7 py-6 flex items-center justify-between gap-6 transition ${
                isSelected
                  ? 'border-[#222222] bg-white shadow-[0_0_0_2px_#222222]'
                  : 'border-[#D2D2D2] bg-[#F7F7F7] hover:border-[#7A7A7A]'
              }`}
            >
              <div>
                <h3 className="text-3xl lg:text-4xl font-medium text-[#222222]">{option.title}</h3>
                <p className="text-xl lg:text-2xl leading-[1.25] text-[#5D5D5D] mt-2 max-w-[900px]">
                  {option.description}
                </p>
              </div>
              <Icon className="w-12 h-12 text-[#222222] flex-shrink-0" strokeWidth={1.8} />
            </button>
          )
        })}
      </div>
    </section>
  )
}
