'use client'

import { useState, useCallback } from 'react'
import { bookingsApi, type CreateBookingResponse } from '@/lib/api/bookings'
import { parseErrorMessage } from '@/lib/utils/parse-error'

interface CreateBookingInput {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
}

interface UseCreateBookingResult {
  createBooking: (input: CreateBookingInput) => Promise<CreateBookingResponse | null>
  isCreating: boolean
  error: string | null
}

/**
 * Capa de aplicación: creación de reserva + intent de pago inicial.
 * Encapsula bookingsApi.create y el manejo de errores/estado.
 */
export function useCreateBooking(): UseCreateBookingResult {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBooking = useCallback(
    async (input: CreateBookingInput): Promise<CreateBookingResponse | null> => {
      setIsCreating(true)
      setError(null)
      try {
        const result = await bookingsApi.create(input)
        return result
      } catch (err) {
        setError(parseErrorMessage(err, 'Error al crear la reserva'))
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [],
  )

  return { createBooking, isCreating, error }
}

