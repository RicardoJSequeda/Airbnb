'use client'

interface DescriptionStepProps {
  description: string
  onDescriptionChange: (value: string) => void
}

export function DescriptionStep({ description, onDescriptionChange }: DescriptionStepProps) {
  const maxLength = 500
  const currentLength = description.length

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-3">
        Escribe tu descripción
      </h2>
      <p className="text-sm text-[#717171] mb-6 max-w-[520px]">
        Comparte lo que hace que tu espacio sea especial.
      </p>

      <div className="border border-[#B0B0B0] rounded-xl overflow-hidden bg-white">
        <textarea
          value={description}
          onChange={(e) => {
            const value = e.target.value
            if (value.length <= maxLength) onDescriptionChange(value)
          }}
          className="w-full h-40 sm:h-44 resize-none outline-none border-none px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-[#222222] placeholder:text-[#B0B0B0]"
          placeholder="Relájate en esta escapada única y tranquila."
        />
        <div className="flex items-center justify-between px-4 sm:px-5 py-2 border-t border-[#E5E5E5] text-xs text-[#717171]">
          <span>
            {currentLength}/{maxLength}
          </span>
        </div>
      </div>
    </section>
  )
}

