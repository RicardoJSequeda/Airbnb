'use client'

/** Controlled por guestsMode (accommodation | participants). Sin condicionales por variante. */
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import ParticipantsSelector from './ParticipantsSelector'
import type { GuestsMode, GuestsValue, ParticipantsValue } from '@/config/search'

const panelContentTransition = { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] as const }

interface GuestsInputProps {
  guestsMode: GuestsMode
  guests?: GuestsValue
  participants?: ParticipantsValue
  onGuestsChange: (guests: GuestsValue) => void
  onParticipantsChange: (participants: ParticipantsValue) => void
  onClose?: () => void
}

const defaultGuests: GuestsValue = { adults: 0, children: 0, babies: 0, pets: 0 }
const defaultParticipants: ParticipantsValue = { adults: 0, children: 0, babies: 0 }

export function GuestsInput({
  guestsMode,
  guests = defaultGuests,
  participants = defaultParticipants,
  onGuestsChange,
  onParticipantsChange,
  onClose,
}: GuestsInputProps) {
  if (guestsMode === null) return null

  if (guestsMode === 'participants') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -3 }}
        transition={panelContentTransition}
        className="p-6"
      >
        <ParticipantsSelector
          value={participants}
          onChange={onParticipantsChange}
          onClose={onClose}
        />
      </motion.div>
    )
  }

  const rows: { key: keyof GuestsValue; label: string; sub: string }[] = [
    { key: 'adults', label: 'Adultos', sub: 'Edad: 13 años o más' },
    { key: 'children', label: 'Niños', sub: 'Edades 2-12' },
    { key: 'babies', label: 'Bebés', sub: 'Menos de 2 años' },
    { key: 'pets', label: 'Mascotas', sub: '¿Traes a un animal de servicio?' },
  ]

  const update = (key: keyof GuestsValue, increment: boolean) => {
    onGuestsChange({
      ...guests,
      [key]: Math.max(0, guests[key] + (increment ? 1 : -1)),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -3 }}
      transition={panelContentTransition}
      className="p-6"
    >
      {rows.map(({ key, label, sub }) => (
        <div
          key={key}
          className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
        >
          <div>
            <div className="font-semibold text-secondary">{label}</div>
            <div className="text-sm text-gray-500">{sub}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update(key, false)}
              disabled={guests[key] === 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-900"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-medium">{guests[key]}</span>
            <button
              type="button"
              onClick={() => update(key, true)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
