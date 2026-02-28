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
  /** Si se pasa, "Mostrar fechas" abre este modal en la misma página en lugar de navegar. */
  onShowDates?: () => void
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
  onShowDates,
}: ExperienceBookingCardProps) {
  const router = useRouter()

  const handleShowDates = () => {
    if (onShowDates) {
      onShowDates()
    } else {
      router.push(`/experiences/${experienceId}/book`)
    }
  }

  return (
    <div className="bg-white border border-[#DDDDDD] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.08)] p-6">
      <div className="space-y-4">
        {/* Fila: Precio a la izquierda, Botón a la derecha */}
        <div className="flex items-center justify-between gap-6">
          {/* Columna izquierda: Precio y detalles */}
          <div className="flex-1 min-w-0 flex flex-col gap-0 leading-none">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-neutral-500 font-normal font-sans">Desde</span>
              <span className="text-sm font-bold text-[#222222] underline decoration-[#222222] decoration-1 font-sans">
                {formatPrice(pricePerParticipant, currency)}
              </span>
            </div>
            <span className="text-sm text-neutral-500 font-normal font-sans">por participante</span>
            <span className="text-sm text-[#E31C5F] underline decoration-[#E31C5F] font-sans">
              Cancelación gratuita
            </span>
          </div>
          
          {/* Botón a la derecha - Gradiente Airbnb con hover */}
          <button
            type="button"
            onClick={handleShowDates}
            className="flex-shrink-0 px-6 py-3 rounded-lg bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:opacity-95 active:scale-[0.98] text-white font-semibold text-base leading-tight transition-all duration-150 ease-out font-sans flex flex-col items-center justify-center"
          >
            <span>Mostrar</span>
            <span>fechas</span>
          </button>
        </div>

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
            {onShowDates ? (
              <button
                type="button"
                onClick={onShowDates}
                className="block w-full text-center text-sm text-[#E31C5F] underline hover:text-[#D70466] transition-colors duration-150 ease-out leading-relaxed"
              >
                Revisa todas las fechas
              </button>
            ) : (
              <a
                href={`/experiences/${experienceId}/book`}
                className="block text-center text-sm text-[#E31C5F] underline hover:text-[#D70466] transition-colors duration-150 ease-out leading-relaxed"
              >
                Revisa todas las fechas
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
