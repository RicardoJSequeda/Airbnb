'use client'

interface WeekendPriceStepProps {
  basePrice: number | null
  weekendPremiumPercent: number | null
  onWeekendPremiumChange: (value: number) => void
}

export function WeekendPriceStep({
  basePrice,
  weekendPremiumPercent,
  onWeekendPremiumChange,
}: WeekendPriceStepProps) {
  const percent = weekendPremiumPercent ?? 7
  const weekendPrice =
    basePrice !== null ? Math.round(basePrice * (1 + percent / 100)).toLocaleString('es-CO') : '0'

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-[32px] font-semibold text-[#222222] mb-2">
        Establece un precio para el fin de semana
      </h2>
      <p className="text-sm text-[#717171] mb-8 max-w-[520px]">
        Agrega una prima para los viernes y sábados.
      </p>

      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="text-[40px] sm:text-[48px] leading-none font-semibold text-[#222222]">
          <span className="align-top text-2xl mr-1">$</span>
          {weekendPrice}
          <span className="ml-1 text-base font-normal">COP</span>
        </div>
        <p className="text-xs text-[#717171]">
          El huésped paga (sin impuestos) <span className="font-medium">$420,289 COP</span>
        </p>
      </div>

      <div className="w-full max-w-[520px] mx-auto">
        <div className="flex items-center justify-between mb-3 text-xs text-[#717171]">
          <span>Prima de fin de semana</span>
          <span>Consejo: Intenta con un 7%</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={99}
            step={1}
            value={percent}
            onChange={(e) => onWeekendPremiumChange(Number(e.target.value))}
            className="flex-1"
          />
          <div className="w-[72px] h-[48px] rounded-lg border border-[#DDDDDD] flex items-center justify-center text-sm font-semibold text-[#222222]">
            {percent}%
          </div>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px] text-[#B0B0B0]">
          <span>0%</span>
          <span>99%</span>
        </div>
      </div>
    </section>
  )
}

