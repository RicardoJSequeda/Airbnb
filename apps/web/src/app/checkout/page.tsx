'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { paymentsApi } from '@/lib/api/payments'
import { env } from '@/lib/env'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'
const STRIPE_KEY = env.stripePublishableKey
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null

function CheckoutForm() {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY)
    if (!raw) {
      setError('Sesión de pago expirada. Vuelve a la reserva.')
      setSubmitting(false)
      return
    }

    try {
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success` : '/checkout/success'
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      })

      if (submitError) {
        setError(submitError.message || 'Error al procesar el pago')
      }
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } }
      setError(axErr.response?.data?.message || 'Error al procesar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
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

    if (!STRIPE_KEY) {
      setError('Configuración de pago no disponible. Contacta con soporte.')
      setLoading(false)
      return
    }

    try {
      const data = JSON.parse(raw) as { bookingId?: string; clientSecret?: string }
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
              })
            )
          })
          .catch((err) => setError(err?.response?.data?.message || 'Error al cargar el pago'))
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

  if (loading && !error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[500px] mx-auto px-6 py-12">
          <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-[500px] mx-auto px-6 py-12">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  if (!clientSecret || !stripePromise) return null

  const options = { clientSecret, appearance: { theme: 'stripe' as const } }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[500px] mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-secondary mb-6">Completar pago</h1>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      </main>
      <Footer />
    </div>
  )
}
