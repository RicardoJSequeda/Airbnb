'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'

function FailureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [details, setDetails] = useState<string | null>(null)

  const reason = useMemo(() => searchParams.get('reason') ?? 'unknown', [searchParams])

  useEffect(() => {
    // Intenta extraer un mensaje útil si viene desde Stripe o desde un redirect interno
    const message = searchParams.get('message')
    if (message) {
      setDetails(message)
      return
    }

    if (reason === 'canceled') setDetails('El pago fue cancelado.')
    else if (reason === 'failed') setDetails('El pago no pudo completarse.')
    else if (reason === 'expired') setDetails('La sesión de pago expiró.')
    else setDetails('No se pudo completar el pago.')
  }, [reason, searchParams])

  const hasCheckoutSession = typeof window !== 'undefined' && !!sessionStorage.getItem(CHECKOUT_DATA_KEY)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[520px] mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-secondary mb-3">No se pudo procesar el pago</h1>
        <p className="text-sm text-gray-600 mb-6">{details}</p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              if (!hasCheckoutSession) {
                router.replace('/my-bookings')
                return
              }
              router.replace('/checkout')
            }}
            className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar pago
          </button>

          <button
            type="button"
            onClick={() => {
              // No borramos la sesión automáticamente para permitir reintentar;
              // si el usuario decide salir, limpiamos para evitar estado viejo.
              try {
                sessionStorage.removeItem(CHECKOUT_DATA_KEY)
              } catch (err) {
                void err
              }
              router.replace('/my-bookings')
            }}
            className="w-full py-3 px-4 border border-gray-300 text-secondary font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Ir a mis reservas
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Si el problema persiste, intenta con otro método de pago o vuelve a intentarlo más tarde.
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Cargando...</p>
      </div>
    }>
      <FailureContent />
    </Suspense>
  )
}

