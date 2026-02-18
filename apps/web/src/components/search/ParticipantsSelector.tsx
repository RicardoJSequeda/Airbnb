'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Participants {
  adults: number
  children: number
  babies: number
}

interface ParticipantsSelectorProps {
  value?: Participants
  onChange: (value: Participants) => void
  onClose?: () => void
}

export default function ParticipantsSelector({
  value,
  onChange,
  onClose,
}: ParticipantsSelectorProps) {
  const [participants, setParticipants] = useState<Participants>(
    value || { adults: 0, children: 0, babies: 0 }
  )

  const updateCount = (type: keyof Participants, delta: number) => {
    const newValue = {
      ...participants,
      [type]: Math.max(0, participants[type] + delta),
    }
    setParticipants(newValue)
    onChange(newValue)
  }

  const total = participants.adults + participants.children + participants.babies

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
      <h3 className="font-semibold text-secondary mb-6">¿Cuántos participantes?</h3>

      <div className="space-y-6">
        {/* Adultos */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-secondary">Adultos</div>
            <div className="text-sm text-gray-500">Edad: 13 años o más</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('adults', -1)}
              disabled={participants.adults === 0}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-secondary">
              {participants.adults}
            </span>
            <button
              onClick={() => updateCount('adults', 1)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Niños */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-secondary">Niños</div>
            <div className="text-sm text-gray-500">Edades 2-12</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('children', -1)}
              disabled={participants.children === 0}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-secondary">
              {participants.children}
            </span>
            <button
              onClick={() => updateCount('children', 1)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bebés */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-secondary">Bebés</div>
            <div className="text-sm text-gray-500">Menos de 2 años</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('babies', -1)}
              disabled={participants.babies === 0}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-secondary">
              {participants.babies}
            </span>
            <button
              onClick={() => updateCount('babies', 1)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {total === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          Selecciona al menos un participante
        </div>
      )}
    </div>
  )
}
