'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { publicPropertiesApi } from '@/lib/api/properties'
import { bookingsApi } from '@/lib/api/bookings'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Property } from '@/types'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'

export default function BookPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const { isAuthenticated } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${propertyId}/book`)
      return
    }
  }, [isAuthenticated, router, propertyId])

  useEffect(() => {
    if (!propertyId) return
    publicPropertiesApi
      .getById(propertyId)
      .then(setProperty)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar')))
      .finally(() => setLoading(false))
  }, [propertyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property || !checkIn || !checkOut) return

    setSubmitting(true)
    setError(null)

    try {
      const result = await bookingsApi.create({
        propertyId,
        checkIn,
        checkOut,
        guests,
      })

      if (!result.clientSecret || !result.paymentIntentId || !result.booking?.id) {
        throw new Error('Respuesta incompleta del servidor')
      }

      sessionStorage.setItem(
        CHECKOUT_DATA_KEY,
        JSON.stringify({
          bookingId: result.booking.id,
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId,
        })
      )
      router.push('/checkout')
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Error al crear la reserva'))
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  if (!isAuthenticated) return null

  if (loading || !property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[600px] mx-auto px-6 py-12">
          <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-[600px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-secondary mb-2">
          Reservar: {property.title}
        </h1>
        <p className="text-secondary mb-6">
          {property.city}, {property.country} · {Number(property.price).toLocaleString()} €/noche
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Fecha de entrada
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={minDate}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Fecha de salida
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || minDate}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Huéspedes (máx. {property.maxGuests})
            </label>
            <input
              type="number"
              min={1}
              max={property.maxGuests}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Procesando...' : 'Continuar al pago'}
            </button>
            <Link
              href={`/properties/${propertyId}`}
              className="py-3 px-4 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
