'use client'

interface BasePriceStepProps {
  basePrice: number | null
  onBasePriceChange: (value: number | null) => void
}

export function BasePriceStep({ basePrice, onBasePriceChange }: BasePriceStepProps) {
  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '')
    if (!cleaned) {
      onBasePriceChange(null)
      return
    }
    const num = Number(cleaned)
    if (!Number.isNaN(num)) onBasePriceChange(num)
  }

  const formatted = basePrice !== null ? basePrice.toLocaleString('es-CO') : ''

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-2">
        Configura un precio base para los días entre semana
      </h2>
      <p className="text-sm text-[#717171] mb-10">
        Consejo: $118,064. Luego establecerás uno para el fin de semana.
      </p>

      <div className="flex flex-col items-center gap-3">
        <div className="text-[56px] sm:text-[64px] leading-none font-semibold text-[#222222]">
          <span className="align-top text-3xl mr-1">$</span>
          <input
            value={formatted}
            onChange={(e) => handleChange(e.target.value)}
            inputMode="numeric"
            className="bg-transparent border-none outline-none text-[56px] sm:text-[64px] leading-none font-semibold text-[#222222] w-[8ch] text-center"
          />
        </div>
        <p className="text-xs text-[#717171]">
          El huésped paga (sin impuestos) <span className="font-medium">$3,928 COP</span>
        </p>
      </div>
    </section>
  )
}

