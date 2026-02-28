'use client'

import { useState, useCallback } from 'react'
import { paymentsApi } from '@/lib/api/payments'
import { parseErrorMessage } from '@/lib/utils/parse-error'

interface UseCreatePaymentIntentResult {
  createPaymentIntent: (bookingId: string) => Promise<{
    clientSecret: string
    paymentIntentId: string
    amount: number
  } | null>
  loading: boolean
  error: string | null
}

/**
 * Capa de aplicación: creación (o recreación) del intent de pago para una reserva.
 * Usado, por ejemplo, cuando el checkout necesita regenerar el clientSecret.
 */
export function useCreatePaymentIntent(): UseCreatePaymentIntentResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPaymentIntent = useCallback(
    async (bookingId: string) => {
      setLoading(true)
      setError(null)
      try {
        const r = await paymentsApi.createIntent(bookingId)
        return {
          clientSecret: r.clientSecret,
          paymentIntentId: r.paymentIntentId,
          amount: r.amount,
        }
      } catch (err) {
        setError(parseErrorMessage(err, 'Error al cargar el pago'))
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { createPaymentIntent, loading, error }
}

