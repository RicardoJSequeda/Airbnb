'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getLocalDateString } from '@/lib/utils'
import type { Property } from '@/types'

interface PropertyBookingWidgetProps {
  property: Property
}

export default function PropertyBookingWidget({ property }: PropertyBookingWidgetProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  const handleReservar = () => {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests > 1) params.set('guests', String(guests))
    const qs = params.toString()
    router.push(`/properties/${property.id}/book${qs ? `?${qs}` : ''}`)
  }

  const price = Number(property.price)
  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 1
  const total = price * (nights > 0 ? nights : 1)

  return (
    <div className="sticky top-24 rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-secondary">
          {price.toLocaleString()} €
        </span>
        <span className="text-secondary">noche</span>
      </div>

      <div className="mt-6 rounded-xl border border-gray-300 overflow-hidden">
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="border-r border-gray-300 p-3">
            <label className="block text-xs font-semibold text-secondary mb-1">
              Entrada
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={getLocalDateString()}
              className="w-full text-sm border-0 p-0 focus:ring-0"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-secondary mb-1">
              Salida
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || getLocalDateString()}
              className="w-full text-sm border-0 p-0 focus:ring-0"
            />
          </div>
        </div>
        <div className="p-3 border-t border-gray-300">
          <label className="block text-xs font-semibold text-secondary mb-1">
            Huéspedes
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm border-0 p-0 focus:ring-0 bg-transparent"
          >
            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'huésped' : 'huéspedes'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleReservar}
        className="mt-6 w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        Reservar
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        Todavía no se hará ningún cargo
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="underline decoration-dotted cursor-help">
            {price.toLocaleString()} € × {nights} {nights === 1 ? 'noche' : 'noches'}
          </span>
          <span>{total.toLocaleString()} €</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        Los precios incluyen todas las tarifas
      </p>
    </div>
  )
}
