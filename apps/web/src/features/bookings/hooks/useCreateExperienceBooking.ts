'use client'

import { useState, useCallback } from 'react'
import { bookingsApi, type CreateBookingResponse } from '@/lib/api/bookings'
import { parseErrorMessage } from '@/lib/utils/parse-error'

interface CreateExperienceBookingInput {
  experienceId: string
  slotId: string
  date: string
  adults: number
  children?: number
}

interface UseCreateExperienceBookingResult {
  createExperienceBooking: (input: CreateExperienceBookingInput) => Promise<CreateBookingResponse | null>
  isCreating: boolean
  error: string | null
}

export function useCreateExperienceBooking(): UseCreateExperienceBookingResult {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createExperienceBooking = useCallback(
    async (input: CreateExperienceBookingInput): Promise<CreateBookingResponse | null> => {
      setIsCreating(true)
      setError(null)
      try {
        const result = await bookingsApi.createExperienceBooking(input)
        return result
      } catch (err) {
        const e = err as { response?: { status?: number; data?: { message?: string } } }
        const status = e.response?.status

        if (status === 409) {
          setError('Este slot ya no está disponible. Por favor elige otro horario.')
          return null
        }

        if (status === 400) {
          setError(e.response?.data?.message ?? 'Solicitud inválida')
          return null
        }

        setError(parseErrorMessage(err, 'Error al crear la reserva'))
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [],
  )

  return { createExperienceBooking, isCreating, error }
}

