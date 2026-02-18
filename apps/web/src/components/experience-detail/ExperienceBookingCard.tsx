'use client'

import { useRouter } from 'next/navigation'
import ExperienceSlotCard from './ExperienceSlotCard'

export interface ExperienceSlot {
  id: string
  dateLabel: string
  timeRange: string
  spotsLeft: number
}

interface ExperienceBookingCardProps {
  experienceId: string
  pricePerParticipant: number
  currency: string
  originalPrice?: number
  slots: ExperienceSlot[]
}

function formatPrice(price: number, currency: string) {
  if (currency === 'COP') return `$${price.toLocaleString('es-CO')} COP`
  return `${price.toLocaleString()} ${currency}`
}

export default function ExperienceBookingCard({
  experienceId,
  pricePerParticipant,
  currency,
  originalPrice,
  slots,
}: ExperienceBookingCardProps) {
  const router = useRouter()

  const handleShowDates = () => {
    router.push(`/experiences/${experienceId}/book`)
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="space-y-4">
        {originalPrice != null && originalPrice > pricePerParticipant && (
          <p className="text-sm text-text-2 line-through">
            Desde {formatPrice(originalPrice, currency)}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold text-secondary">
            {formatPrice(pricePerParticipant, currency)}
          </span>
          <span className="text-text-2 text-sm">por participante</span>
        </div>
        <p className="text-sm text-primary">Cancelación gratuita</p>

        <button
          type="button"
          onClick={handleShowDates}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-primary text-white font-semibold hover:opacity-95 transition-opacity"
        >
          Mostrar fechas
        </button>

        {slots.length > 0 && (
          <div className="space-y-3 pt-2">
            {slots.slice(0, 5).map((slot) => (
              <ExperienceSlotCard
                key={slot.id}
                dateLabel={slot.dateLabel}
                timeRange={slot.timeRange}
                spotsLeft={slot.spotsLeft}
                onClick={() => router.push(`/experiences/${experienceId}/book?slot=${slot.id}`)}
              />
            ))}
            <a
              href={`/experiences/${experienceId}/book`}
              className="block text-center text-sm text-primary underline"
            >
              Revisa todas las fechas
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
