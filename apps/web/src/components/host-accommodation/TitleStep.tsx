'use client'

interface TitleStepProps {
  title: string
  onTitleChange: (value: string) => void
}

export function TitleStep({ title, onTitleChange }: TitleStepProps) {
  const maxLength = 50
  const currentLength = title.length

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-3">
        Ahora, ponle un título a tu casa
      </h2>
      <p className="text-sm text-[#717171] mb-6 max-w-[520px]">
        Los títulos cortos funcionan mejor. No te preocupes, puedes modificarlo más adelante.
      </p>

      <div className="border border-[#B0B0B0] rounded-xl overflow-hidden bg-white">
        <textarea
          value={title}
          onChange={(e) => {
            const value = e.target.value
            if (value.length <= maxLength) onTitleChange(value)
          }}
          className="w-full h-32 sm:h-36 resize-none outline-none border-none px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-[#222222] placeholder:text-[#B0B0B0]"
          placeholder="Escribe un título para tu alojamiento"
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

