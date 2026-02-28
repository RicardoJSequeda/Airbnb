'use client'

interface ExperienceSlotCardProps {
  dateLabel: string
  timeRange: string
  spotsLeft: number
  onClick?: () => void
}

export default function ExperienceSlotCard({
  dateLabel,
  timeRange,
  spotsLeft,
  onClick,
}: ExperienceSlotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[#EBEBEB] bg-white p-4 mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-black hover:shadow-[0_2px_4px_rgba(0,0,0,0.08)] transition-all duration-150 last:mb-0 font-sans"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-[#222222] leading-relaxed font-sans">{dateLabel}</p>
          <p className="text-sm text-[#717171] mt-0.5 leading-relaxed font-normal font-sans">{timeRange}</p>
        </div>
        <span className="text-sm text-[#222222] whitespace-nowrap font-medium font-sans">
          {spotsLeft} {spotsLeft === 1 ? 'cupo disponible' : 'cupos disponibles'}
        </span>
      </div>
    </button>
  )
}
