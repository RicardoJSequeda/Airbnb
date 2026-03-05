import { propertyTypeOptions } from './data'

interface PropertyTypeStepProps {
  selectedTypeId: string | null
  onSelect: (id: string) => void
}

export function PropertyTypeStep({ selectedTypeId, onSelect }: PropertyTypeStepProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-6">
      <h2 className="text-5xl lg:text-6xl leading-[1.05] font-semibold text-[#222222] mb-10 max-w-[980px]">
        ¿Cuál de estas opciones describe mejor tu espacio?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
        {propertyTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedTypeId === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`text-left rounded-2xl border p-6 min-h-[180px] transition ${
                isSelected
                  ? 'border-[#222222] bg-white shadow-[0_0_0_2px_#222222]'
                  : 'border-[#D2D2D2] bg-[#F7F7F7] hover:border-[#7A7A7A]'
              }`}
            >
              <Icon className="w-11 h-11 text-[#222222] mb-5" strokeWidth={1.8} />
              <p className="text-3xl font-medium text-[#222222]">{option.label}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
