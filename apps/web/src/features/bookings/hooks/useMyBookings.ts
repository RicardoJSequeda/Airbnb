'use client'

import { useEffect, useState, useCallback } from 'react'
import { bookingsApi } from '@/lib/api/bookings'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Booking } from '@/types'

interface UseMyBookingsResult {
  bookings: Booking[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Capa de aplicación: listado de reservas del usuario.
 * La UI no debería llamar a lib/api/bookings directamente para "mis reservas".
 */
export function useMyBookings(isAuthenticated: boolean): UseMyBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const data = await bookingsApi.getMyBookings()
      setBookings(data)
    } catch (err) {
      setError(parseErrorMessage(err, 'Error al cargar'))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setBookings([])
      setLoading(false)
      setError(null)
      return
    }
    refetch()
  }, [isAuthenticated, refetch])

  return { bookings, loading, error, refetch }
}
