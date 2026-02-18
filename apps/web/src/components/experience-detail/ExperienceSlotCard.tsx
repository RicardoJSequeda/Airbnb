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
      className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition-colors"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-secondary">{dateLabel}</p>
          <p className="text-sm text-text-2 mt-0.5">{timeRange}</p>
        </div>
        <span className="text-sm text-text-2 whitespace-nowrap">
          {spotsLeft} {spotsLeft === 1 ? 'cupo disponible' : 'cupos disponibles'}
        </span>
      </div>
    </button>
  )
}
