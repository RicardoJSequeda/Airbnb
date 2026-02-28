'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import CreateReviewModal from '@/components/reviews/create-review-modal'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'
import { useMyBookings } from '@/features/bookings/hooks/useMyBookings'
import { useCancelBooking } from '@/features/bookings/hooks/useCancelBooking'
import { useCreatePaymentIntent } from '@/features/payments/hooks'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Booking } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  REFUNDED: 'Reembolsada',
}

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const { bookings, loading, error, refetch } = useMyBookings(!!isAuthenticated)
  const { cancel: cancelBooking, isCancelling, error: cancelError } = useCancelBooking()
  const { createPaymentIntent, loading: creatingIntent, error: paymentError } = useCreatePaymentIntent()
  const [reviewModalBooking, setReviewModalBooking] = useState<{
    id: string
    title?: string
  } | null>(null)

  useEffect(() => {
    if (!isAuthenticated) openLoginModal('/my-bookings')
  }, [isAuthenticated, openLoginModal])

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    const ok = await cancelBooking(id)
    if (ok) refetch()
    else if (cancelError) alert(cancelError)
  }

  const handlePayNow = async (booking: Booking) => {
    const r = await createPaymentIntent(booking.id)
    if (!r) {
      if (paymentError) alert(paymentError)
      return
    }
    sessionStorage.setItem(
      'checkout_booking_data',
      JSON.stringify({
        bookingId: booking.id,
        clientSecret: r.clientSecret,
        paymentIntentId: r.paymentIntentId,
      }),
    )
    router.push('/checkout')
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[800px] mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-[800px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-secondary mb-6">Mis reservas</h1>

        {(error || cancelError || paymentError) && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error || cancelError || paymentError}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="text-center py-12 text-secondary">
            <p className="mb-4">No tienes reservas todavía.</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Explorar alojamientos
            </Link>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="flex gap-4 p-4 border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <div className="w-28 h-28 flex-shrink-0 relative rounded-lg overflow-hidden">
                  {booking.property?.images?.[0] ? (
                    <Image
                      src={booking.property.images[0]}
                      alt={booking.property?.title || 'Propiedad'}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/properties/${booking.propertyId}`}
                    className="font-medium text-secondary hover:underline"
                  >
                    {booking.property?.title || 'Propiedad'}
                  </Link>
                  <p className="text-sm text-secondary mt-0.5">
                    {booking.property?.city}, {booking.property?.country}
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    {new Date(booking.checkIn).toLocaleDateString('es')} – {new Date(booking.checkOut).toLocaleDateString('es')} · {booking.guests} huésped{booking.guests > 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm font-medium mt-1">{Number(booking.totalPrice).toLocaleString()} €</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-secondary">
                    {STATUS_LABELS[booking.status] ?? booking.status}
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {booking.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(booking.id)}
                        disabled={isCancelling}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelando…' : 'Cancelar reserva'}
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => handlePayNow(booking)}
                        disabled={creatingIntent}
                        className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
                      >
                        {creatingIntent ? 'Preparando pago…' : 'Pagar ahora'}
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <button
                        type="button"
                        onClick={() =>
                          setReviewModalBooking({
                            id: booking.id,
                            title: booking.property?.title,
                          })
                        }
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Dejar reseña
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )        )}
      </ul>
        )}

        <CreateReviewModal
          open={!!reviewModalBooking}
          onClose={() => setReviewModalBooking(null)}
          bookingId={reviewModalBooking?.id ?? ''}
          propertyTitle={reviewModalBooking?.title}
          onSuccess={() => {
            setReviewModalBooking(null)
            refetch()
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
