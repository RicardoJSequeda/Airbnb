'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { paymentsApi } from '@/lib/api/payments'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    const redirectStatus = searchParams.get('redirect_status')

    if (redirectStatus === 'succeeded' && paymentIntent) {
      const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY)
      if (raw) {
        const { bookingId } = JSON.parse(raw) as { bookingId: string }
        paymentsApi
          .confirm(paymentIntent, bookingId)
          .then(() => {
            sessionStorage.removeItem(CHECKOUT_DATA_KEY)
            router.replace('/my-bookings')
          })
          .catch(() => {
            sessionStorage.removeItem(CHECKOUT_DATA_KEY)
            router.replace('/my-bookings')
          })
      } else {
        router.replace('/my-bookings')
      }
    } else {
      router.replace('/my-bookings')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[500px] mx-auto px-6 py-12 text-center">
        <p className="text-secondary">Procesando tu pago...</p>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary">Cargando...</p>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
