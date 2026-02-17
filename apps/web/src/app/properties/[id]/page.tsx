'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { publicPropertiesApi } from '@/lib/api/properties'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Property } from '@/types'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { isAuthenticated } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    publicPropertiesApi
      .getById(id)
      .then(setProperty)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar la propiedad')))
      .finally(() => setLoading(false))
  }, [id])

  const handleReservar = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${id}`)
      return
    }
    router.push(`/properties/${id}/book`)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="aspect-video bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error || 'Propiedad no encontrada'}</p>
          </div>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = Array.isArray(property.images) ? property.images : []
  const amenities = Array.isArray(property.amenities) ? property.amenities : []

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              {images.length > 0 ? (
                <Image
                  src={images[0]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-secondary">{property.title}</h1>
              <p className="text-secondary mt-1">
                {property.city}, {property.country}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-secondary">{property.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Características</h2>
              <ul className="grid grid-cols-2 gap-2 text-secondary">
                <li>{property.bedrooms} habitaciones</li>
                <li>{property.bathrooms} baños</li>
                <li>{property.maxGuests} huéspedes máximo</li>
                <li>Tipo: {property.propertyType}</li>
              </ul>
            </div>

            {amenities.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4">Comodidades</h2>
                <ul className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <li
                      key={i}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-secondary"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-secondary">
                  {Number(property.price).toLocaleString()} €
                </span>
                <span className="text-secondary">noche</span>
              </div>

              <button
                onClick={handleReservar}
                className="mt-6 w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reservar
              </button>

              <p className="mt-4 text-sm text-center text-gray-500">
                {isAuthenticated
                  ? 'Selecciona fechas y huéspedes en el siguiente paso'
                  : 'Inicia sesión para reservar'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
