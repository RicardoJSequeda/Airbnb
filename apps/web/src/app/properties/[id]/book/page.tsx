'use client'

import { Suspense, useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import Header from '@/components/layout/header'
import LoginModal from '@/components/shared/LoginModal'
import Footer from '@/components/layout/footer'
import { publicPropertiesApi } from '@/lib/api/properties'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import { getLocalDateString } from '@/lib/utils'
import type { Property } from '@/types'
import { useCreateBooking } from '@/features/bookings/hooks'

const CHECKOUT_DATA_KEY = 'checkout_booking_data'

function BookPropertyContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = params.id as string
  const { isAuthenticated } = useAuthStore()
  const { createBooking, isCreating, error: createError } = useCreateBooking()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [profilePhotoAdded, setProfilePhotoAdded] = useState(false)
  const [communityAccepted, setCommunityAccepted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'googlePay'>('card')

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '')
  const [guests, setGuests] = useState(
    Math.min(Math.max(1, parseInt(searchParams.get('guests') ?? '1', 10)), 16)
  )

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

    if (!isAuthenticated) {
      setLoginModalOpen(true)
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await createBooking({
      propertyId,
      checkIn,
      checkOut,
      guests,
    })

    if (!result) {
      setError(createError ?? 'Error al crear la reserva')
      setSubmitting(false)
      return
    }

    if (!result.clientSecret || !result.paymentIntentId || !result.booking?.id) {
      setError('Respuesta incompleta del servidor')
      setSubmitting(false)
      return
    }

    sessionStorage.setItem(
      CHECKOUT_DATA_KEY,
      JSON.stringify({
        bookingId: result.booking.id,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      }),
    )
    router.push('/checkout')
    setSubmitting(false)
  }

  const minDate = getLocalDateString()

  if (loading || !property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />
        </div>
        <Footer />
      </div>
    )
  }

  const pricePerNight = Number(property.price) || 0
  const checkInDate = checkIn ? new Date(checkIn) : null
  const checkOutDate = checkOut ? new Date(checkOut) : null
  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : 1
  const totalPrice = pricePerNight * nights

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1100px] mx-auto px-6 py-8 pt-24">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-sm text-secondary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-semibold text-secondary mb-6">Confirma y paga</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] gap-8 items-start">
          {/* Columna izquierda: pasos */}
          <div className="space-y-4">
            {/* Paso 1: método de pago */}
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-secondary">
                1. Agrega un método de pago
              </p>
              {/* Tarjeta de crédito / débito */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
                      <span className="text-[10px] text-white font-semibold">V/M</span>
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      Tarjeta de crédito o débito
                    </span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'border-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <span className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </span>
                </button>

                {paymentMethod === 'card' && (
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="1234 1234 1234 1234"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-1">
                          Caducidad
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary mb-1">
                          Código CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="***"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        Código postal
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ej. 110111"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1">
                        País/región
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="co">Colombia</option>
                        <option value="es">España</option>
                        <option value="us">Estados Unidos</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Pay como opción alternativa */}
              <button
                type="button"
                onClick={() => setPaymentMethod('googlePay')}
                className="mt-2 flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center">
                    <span className="text-[10px] text-white font-semibold">G</span>
                  </div>
                  <span className="text-sm text-secondary">Google Pay</span>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'googlePay'
                      ? 'border-black'
                      : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'googlePay' && (
                    <span className="w-2 h-2 rounded-full bg-black" />
                  )}
                </span>
              </button>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-black/90"
                  onClick={() => {
                    // visual only, siguiente paso
                    const target = document.getElementById('step-2')
                    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  Siguiente
                </button>
              </div>
            </div>

            {/* Paso 2: foto de perfil */}
            <div
              id="step-2"
              className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-secondary">
                  2. Agrega una foto de perfil
                </p>
                {profilePhotoAdded && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    Se agregó correctamente
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Los anfitriones quieren saber quién se queda en su alojamiento. Elige una
                imagen en la que se vea tu rostro. Solo se mostrará cuando la reservación
                esté confirmada.
              </p>
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-24 h-24 rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-semibold">
                  {isAuthenticated ? (property.host?.name?.[0]?.toUpperCase() ?? 'R') : 'R'}
                </div>
                <button
                  type="button"
                  onClick={() => setProfilePhotoAdded(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  {profilePhotoAdded ? 'Cambiar foto' : 'Agrega una foto'}
                </button>
              </div>
            </div>

            {/* Paso 3: política de la comunidad */}
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-3">
              <p className="text-sm font-semibold text-secondary">
                3. Revisa nuestra política para la comunidad
              </p>
              <p className="text-xs text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                Entiendo que esta plataforma apoya las investigaciones de las autoridades
                locales y puede eliminar mi cuenta por cualquier violación de esta
                política. El trabajo sexual en los alojamientos está prohibido y el turismo
                sexual contradice los valores de la comunidad. También se han presentado
                incidentes de seguridad relacionados con estas actividades, por lo que se
                prohíben estrictamente.{' '}
                <span className="underline cursor-pointer">Más información</span>.
              </p>
              <label className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={communityAccepted}
                  onChange={(e) => setCommunityAccepted(e.target.checked)}
                />
                <span>
                  Confirmo que he leído y acepto la política para la comunidad y las normas
                  de convivencia del alojamiento.
                </span>
              </label>
            </div>

            {/* Paso 4: revisar la reservación */}
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-4">
              <p className="text-sm font-semibold text-secondary">
                4. Revisa la reservación
              </p>
              <p className="text-xs text-gray-500">
                Al seleccionar el botón, aceptas los términos de la reservación y las
                políticas de cancelación aplicables.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Fecha de entrada
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={minDate}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Fecha de salida
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || minDate}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Huéspedes (máx. {property.maxGuests})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={property.maxGuests}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !communityAccepted}
                    className="flex-1 py-3 px-4 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-colors disabled:opacity-40"
                  >
                    {submitting ? 'Procesando...' : 'Pagar con Google Pay'}
                  </button>
                  <Link
                    href={`/properties/${propertyId}`}
                    className="py-3 px-4 border border-gray-300 rounded-lg text-secondary hover:bg-gray-50 text-center"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Columna derecha: resumen de reserva */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {Array.isArray(property.images) && property.images[0] && (
                  <Image
                    src={property.images[0]}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary truncate">
                  {property.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {property.city}, {property.country}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span>{(property.averageRating ?? 0).toFixed(2)}</span>
                  {property.totalReviews ? (
                    <span>· {property.totalReviews} reseñas</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Texto de política / no reembolsable */}
            <div className="pt-2 text-xs text-gray-600 space-y-1">
              <p>Esta reservación no es reembolsable.</p>
              <button
                type="button"
                className="underline font-medium hover:text-secondary"
              >
                Política completa
              </button>
            </div>

            <div className="mt-3 text-xs text-secondary border-t border-b border-gray-200 py-3 space-y-3">
              <div>
                <p className="font-semibold text-xs">Fechas</p>
                <p className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">
                    {checkIn || 'Agregar'} – {checkOut || 'Agregar'}
                  </span>
                  <button
                    type="button"
                    className="ml-3 px-3 py-1 rounded-lg border border-gray-300 text-[11px] font-semibold hover:bg-gray-50"
                  >
                    Cambiar
                  </button>
                </p>
              </div>
              <div>
                <p className="font-semibold text-xs">Huéspedes</p>
                <p className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">
                    {guests} {guests === 1 ? 'huésped' : 'huéspedes'}
                  </span>
                  <button
                    type="button"
                    className="ml-3 px-3 py-1 rounded-lg border border-gray-300 text-[11px] font-semibold hover:bg-gray-50"
                  >
                    Cambiar
                  </button>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-secondary">
              <p className="font-semibold text-sm">Información del precio</p>
              <div className="flex justify-between text-sm items-baseline">
                <span className="underline decoration-dotted cursor-default">
                  {nights} {nights === 1 ? 'noche' : 'noches'} ×{' '}
                  {pricePerNight.toLocaleString()} €
                </span>
                <div className="text-right space-y-0.5">
                  <p className="text-[11px] text-gray-400 line-through">
                    {(totalPrice * 1.2).toLocaleString()} €
                  </p>
                  <p>{totalPrice.toLocaleString()} €</p>
                </div>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-1">
                <span>
                  Total <span className="underline decoration-dotted cursor-pointer">COP</span>
                </span>
                <span>{totalPrice.toLocaleString()} €</span>
              </div>
              <button
                type="button"
                className="text-sm underline font-medium mt-1 text-secondary text-left"
              >
                Desglose del precio
              </button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Badge verde similar a \"precio por debajo del promedio\" */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[700px] px-6">
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 text-emerald-800 px-4 py-3 text-sm shadow-sm">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
            %
          </div>
          <p>
            El precio está por debajo del promedio para los próximos{' '}
            <span className="font-semibold">60 días</span>.
          </p>
        </div>
      </div>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirect={`/properties/${propertyId}/book?${new URLSearchParams({
          checkIn,
          checkOut,
          guests: String(guests),
        }).toString()}`}
      />
    </div>
  )
}

function BookPropertyFallback() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function BookPropertyPage() {
  return (
    <Suspense fallback={<BookPropertyFallback />}>
      <BookPropertyContent />
    </Suspense>
  )
}
