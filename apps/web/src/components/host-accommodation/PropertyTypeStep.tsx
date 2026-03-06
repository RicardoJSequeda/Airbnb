import { propertyTypeOptions } from './data'

interface PropertyTypeStepProps {
  selectedTypeId: string | null
  onSelect: (id: string) => void
}

export function PropertyTypeStep({ selectedTypeId, onSelect }: PropertyTypeStepProps) {
  return (
    <section className="max-w-[800px] mx-auto px-3 sm:px-4 py-3">
      <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-4 max-w-[520px]">
        ¿Cuál de estas opciones describe mejor tu espacio?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 pb-4">
        {propertyTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedTypeId === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`text-left rounded-lg border p-3 min-h-[72px] sm:min-h-[76px] transition ${
                isSelected
                  ? 'border-[#222222] bg-white shadow-[0_0_0_2px_#222222]'
                  : 'border-[#D2D2D2] bg-[#F7F7F7] hover:border-[#7A7A7A]'
              }`}
            >
              <Icon className="w-6 h-6 text-[#222222] mb-1.5" strokeWidth={1.8} />
              <p className="text-sm font-medium text-[#222222] leading-tight">{option.label}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
