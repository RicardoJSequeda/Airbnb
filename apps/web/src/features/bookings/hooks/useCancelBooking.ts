'use client'

import { useState, useCallback } from 'react'
import { bookingsApi } from '@/lib/api/bookings'
import { parseErrorMessage } from '@/lib/utils/parse-error'

interface UseCancelBookingResult {
  cancel: (id: string) => Promise<boolean>
  isCancelling: boolean
  error: string | null
}

/**
 * Capa de aplicación: cancelar una reserva.
 * Devuelve true si tuvo éxito, false si falló (error queda en .error).
 */
export function useCancelBooking(): UseCancelBookingResult {
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancel = useCallback(async (id: string): Promise<boolean> => {
    setIsCancelling(true)
    setError(null)
    try {
      await bookingsApi.cancel(id)
      return true
    } catch (err) {
      setError(parseErrorMessage(err, 'Error al cancelar'))
      return false
    } finally {
      setIsCancelling(false)
    }
  }, [])

  return { cancel, isCancelling, error }
}
