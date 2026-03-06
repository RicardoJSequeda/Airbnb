'use client'

import { Minus, Plus } from 'lucide-react'

interface CounterRowProps {
  label: string
  value: number
  min: number
  max: number
  onDecrement: () => void
  onIncrement: () => void
}

function CounterRow({ label, value, min, max, onDecrement, onIncrement }: CounterRowProps) {
  const canDecrement = value > min
  const canIncrement = value < max

  return (
    <div className="flex items-center justify-between w-full py-3">
      <span className="text-base font-medium text-[#222222]">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          className="w-10 h-10 rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center text-[#222222] hover:border-[#222222] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#DDDDDD] transition"
          aria-label={`Menos ${label}`}
        >
          <Minus className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <span className="min-w-[2rem] text-center text-base font-medium text-[#222222]">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          className="w-10 h-10 rounded-full border border-[#DDDDDD] bg-white flex items-center justify-center text-[#222222] hover:border-[#222222] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#DDDDDD] transition"
          aria-label={`Más ${label}`}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

interface BasicsStepProps {
  guests: number
  beds: number
  bathrooms: number
  onGuestsChange: (n: number) => void
  onBedsChange: (n: number) => void
  onBathroomsChange: (n: number) => void
}

const MIN_GUESTS = 1
const MAX_GUESTS = 16
const MIN_BEDS = 1
const MAX_BEDS = 50
const MIN_BATHROOMS = 1
const MAX_BATHROOMS = 20

export function BasicsStep({
  guests,
  beds,
  bathrooms,
  onGuestsChange,
  onBedsChange,
  onBathroomsChange,
}: BasicsStepProps) {
  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-[480px] mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#222222] mb-2">
            Agrega algunos datos básicos sobre tu espacio
          </h2>
          <p className="text-sm text-[#717171] mb-6">
            Después podrás agregar más información, como los tipos de cama.
          </p>

          <div className="w-full">
            <CounterRow
              label="Huéspedes"
              value={guests}
              min={MIN_GUESTS}
              max={MAX_GUESTS}
              onDecrement={() => onGuestsChange(Math.max(MIN_GUESTS, guests - 1))}
              onIncrement={() => onGuestsChange(Math.min(MAX_GUESTS, guests + 1))}
            />
            <CounterRow
              label="Camas"
              value={beds}
              min={MIN_BEDS}
              max={MAX_BEDS}
              onDecrement={() => onBedsChange(Math.max(MIN_BEDS, beds - 1))}
              onIncrement={() => onBedsChange(Math.min(MAX_BEDS, beds + 1))}
            />
            <CounterRow
              label="Baños"
              value={bathrooms}
              min={MIN_BATHROOMS}
              max={MAX_BATHROOMS}
              onDecrement={() => onBathroomsChange(Math.max(MIN_BATHROOMS, bathrooms - 1))}
              onIncrement={() => onBathroomsChange(Math.min(MAX_BATHROOMS, bathrooms + 1))}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
