'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { paymentsApi } from '@/lib/api/payments'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import { env } from '@/lib/env'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'

interface CheckoutSessionState {
  clientSecret: string | null
  loading: boolean
  error: string | null
}

/**
 * Capa de aplicación: gestiona la sesión de checkout a partir de sessionStorage.
 * - Lee bookingId/clientSecret/paymentIntentId del storage.
 * - Si falta clientSecret pero hay bookingId, llama a paymentsApi.createIntent.
 */
export function useCheckoutSession(): CheckoutSessionState {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY)
    if (!raw) {
      router.push('/')
      setLoading(false)
      return
    }

    if (!env.stripePublishableKey) {
      setError('Configuración de pago no disponible. Contacta con soporte.')
      setLoading(false)
      return
    }

    try {
      const data = JSON.parse(raw) as { bookingId?: string; clientSecret?: string; paymentIntentId?: string }
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setLoading(false)
      } else if (data.bookingId) {
        paymentsApi
          .createIntent(data.bookingId)
          .then((r) => {
            setClientSecret(r.clientSecret)
            sessionStorage.setItem(
              CHECKOUT_DATA_KEY,
              JSON.stringify({
                ...data,
                clientSecret: r.clientSecret,
                paymentIntentId: r.paymentIntentId,
              }),
            )
          })
          .catch((err) => setError(parseErrorMessage(err, 'Error al cargar el pago')))
          .finally(() => setLoading(false))
      } else {
        setError('Datos de pago incompletos')
        setLoading(false)
      }
    } catch {
      setError('Sesión de pago inválida')
      setLoading(false)
    }
  }, [router])

  return { clientSecret, loading, error }
}

