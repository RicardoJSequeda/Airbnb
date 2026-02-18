'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Sparkles } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ReviewCard from '@/components/reviews/review-card'
import PropertyHeaderActions from '@/components/property-detail/property-header-actions'
import PropertyImageGallery from '@/components/property-detail/property-image-gallery'
import PropertyDetailTabs, { type PropertyTabId } from '@/components/property-detail/property-detail-tabs'
import PropertyHostCard from '@/components/property-detail/property-host-card'
import PropertyBookingWidget from '@/components/property-detail/property-booking-widget'
import PropertyMap from '@/components/property-detail/property-map'
import { publicPropertiesApi } from '@/lib/api/properties'
import { favoritesApi } from '@/lib/api/favorites'
import { useAuthStore } from '@/lib/stores/auth-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Property, Review } from '@/types'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { isAuthenticated } = useAuthStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PropertyTabId>('overview')

  useEffect(() => {
    if (!id) return
    publicPropertiesApi
      .getById(id)
      .then(setProperty)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar la propiedad')))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !isAuthenticated) return
    favoritesApi
      .check(id)
      .then((res) => setIsFavorite(res.isFavorite))
      .catch(() => {})
  }, [id, isAuthenticated])

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
  const reviews = (property.reviews ?? []) as Review[]
  const rating = property.averageRating ?? 0
  const totalReviews = property.totalReviews ?? 0
  const isFavoriteAmongGuests = rating >= 4.8 && totalReviews >= 5

  const propertyTypeLabel = property.propertyType || 'Alojamiento'
  const bedsLabel = property.bedrooms === 1 ? '1 cama' : `${property.bedrooms} camas`

  return (
    <div className="min-h-screen">
      <Header />

      <main className="w-full max-w-[1200px] mx-auto px-6 py-6 pt-24">
        {/* Galería 5 fotos - arriba, resto del contenido abajo */}
        <div className="mb-8">
          <PropertyImageGallery images={images} title={property.title} />
        </div>

        {/* Contenido abajo: título, detalles, tabs + widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Título con Compartir y Guardar - como referencia Airbnb */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl font-semibold text-secondary flex-1 min-w-0">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PropertyHeaderActions
                  propertyId={property.id}
                  isFavorite={isFavorite}
                  onFavoriteChange={setIsFavorite}
                  showBack={false}
                />
              </div>
            </div>

            {/* "Alojamiento entero: loft en Medellín, Colombia" */}
            <p className="text-secondary font-medium">
              Alojamiento entero: {propertyTypeLabel.toLowerCase()} en {property.city}, {property.country}
            </p>

            {/* "2 huéspedes - Estudio - 1 cama - 1 baño" */}
            <p className="text-secondary text-sm">
              {property.maxGuests} {property.maxGuests === 1 ? 'huésped' : 'huéspedes'} · {propertyTypeLabel} · {bedsLabel} · {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}
            </p>

            {/* Favorito entre huéspedes + rating */}
            <div className="flex flex-wrap items-center gap-2">
              {isFavoriteAmongGuests && (
                <span className="px-2 py-0.5 text-sm font-medium text-secondary bg-gray-100 rounded">
                  Favorito entre huéspedes
                </span>
              )}
              <span className="text-sm text-gray-600">
                Según los huéspedes, uno de los alojamientos más valorados
              </span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-medium">{rating.toFixed(2)}</span>
                <span className="text-gray-500">
                  · {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
            </div>

            <PropertyDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'overview' && (
              <div className="space-y-6 pt-4">
                <PropertyHostCard property={property} />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Descripción</h2>
                  <p className="text-secondary whitespace-pre-line">{property.description}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Características</h2>
                  <ul className="grid grid-cols-2 gap-2 text-secondary">
                    <li>{property.bedrooms} habitaciones</li>
                    <li>{property.bathrooms} baños</li>
                    <li>{property.maxGuests} huéspedes máximo</li>
                    <li>Tipo: {property.propertyType}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="pt-4">
                <h2 className="text-lg font-semibold mb-4">Comodidades</h2>
                <ul className="grid grid-cols-2 gap-3">
                  {amenities.length > 0 ? (
                    amenities.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {a}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Sin comodidades especificadas</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <h2 className="text-lg font-semibold">
                    {rating.toFixed(1)} · {totalReviews}{' '}
                    {totalReviews === 1 ? 'reseña' : 'reseñas'}
                  </h2>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary text-sm">
                    Aún no hay reseñas. ¡Sé el primero en dejar una!
                  </p>
                )}
              </div>
            )}

            {activeTab === 'location' && (
              <div className="pt-4">
                <h2 className="text-lg font-semibold mb-2">Ubicación</h2>
                <p className="text-secondary mb-4">{property.address}</p>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  address={property.address}
                  title={property.title}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            {isFavoriteAmongGuests && (
              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm flex gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">¡Un hallazgo excepcional!</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Este lugar normalmente está reservado.
                  </p>
                </div>
              </div>
            )}
            <PropertyBookingWidget property={property} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
