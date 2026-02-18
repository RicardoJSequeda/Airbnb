'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal, Star } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { publicPropertiesApi } from '@/lib/api/properties'
import { favoritesApi } from '@/lib/api/favorites'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toPropertyCardDisplay } from '@/lib/utils/property-mapper'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Property } from '@/types'
import type { PropertyCardDisplay } from '@/components/home/property-carousel'

/** Distancia en km entre dos puntos (fórmula de Haversine) */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') ?? ''
  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const lat = latParam ? parseFloat(latParam) : null
  const lng = lngParam ? parseFloat(lngParam) : null
  const isNearby = lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''
  const guestsParam = searchParams.get('guests') ?? '1'
  const guests = parseInt(guestsParam, 10) || 1

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const filters = city && !isNearby ? { city } : {}
    publicPropertiesApi
      .getAll(filters)
      .then((data) => {
        let filtered = data
        if (guests > 1) {
          filtered = filtered.filter((p) => p.maxGuests >= guests)
        }
        if (isNearby && lat != null && lng != null) {
          filtered = filtered
            .filter((p) => p.latitude != null && p.longitude != null)
            .sort((a, b) => {
              const distA = haversineDistance(lat, lng, a.latitude!, a.longitude!)
              const distB = haversineDistance(lat, lng, b.latitude!, b.longitude!)
              return distA - distB
            })
            .slice(0, 50) // Top 50 más cercanos
        }
        setProperties(filtered)
      })
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar')))
      .finally(() => setLoading(false))
  }, [city, guests, isNearby, lat, lng])

  const searchSummary = [
    isNearby ? 'Cerca de ti' : city ? `Alojamientos en ${city}` : null,
    checkIn && checkOut ? `${checkIn} - ${checkOut}` : null,
    `${guests} ${guests === 1 ? 'huésped' : 'huéspedes'}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />

      {/* Barra de búsqueda compacta */}
      <div className="sticky top-20 z-30 bg-white border-b px-4 py-3">
        <div className="max-w-[1824px] mx-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {searchSummary || 'Alojamientos en esta zona del mapa'}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50 text-sm font-medium">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 text-sm font-medium"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1824px] w-full mx-auto">
        {/* Listado izquierda */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-secondary">
              {properties.length > 0
                ? `Más de ${properties.length} alojamiento${properties.length !== 1 ? 's' : ''} dentro de la zona del mapa`
                : 'No hay alojamientos que coincidan con tu búsqueda'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-gray-200 rounded" />
              Los precios incluyen todas las tarifas
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded mt-2 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded mt-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-secondary">No se encontraron propiedades</p>
              <p className="text-sm text-gray-500 mt-1">
                Prueba con otros criterios de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {properties.map((property) => (
                <SearchResultCard
                  key={property.id}
                  property={property}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                  isAuthenticated={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mapa derecha - sticky */}
        <div className="hidden lg:block lg:w-[45%] lg:min-w-[400px] sticky top-[140px] h-[calc(100vh-140px)]">
          <div className="h-full w-full p-2">
            {properties.length > 0 && (
              <SearchMapSection
                properties={properties}
                userLocation={isNearby && lat != null && lng != null ? { lat, lng } : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mapa móvil - colapsable */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-20">
        <button
          onClick={() => setShowMap((v) => !v)}
          className="w-full py-3 px-4 bg-white border rounded-xl shadow-lg font-medium flex items-center justify-center gap-2"
        >
          {showMap ? 'Ocultar mapa' : 'Ver mapa'}
        </button>
      </div>
      {showMap && (
        <div className="lg:hidden fixed inset-0 top-auto h-[50vh] z-30 border-t bg-white">
          <div className="h-full">
            {properties.length > 0 && (
              <SearchMapSection
                properties={properties}
                userLocation={isNearby && lat != null && lng != null ? { lat, lng } : undefined}
              />
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

function SearchResultCard({
  property,
  checkIn,
  checkOut,
  guests,
}: {
  property: Property
  checkIn: string
  checkOut: string
  guests: number
  isAuthenticated: boolean
}) {
  const card = toPropertyCardDisplay(property)

  const params: Record<string, string> = {}
  if (checkIn) params.checkIn = checkIn
  if (checkOut) params.checkOut = checkOut
  if (guests > 1) params.guests = String(guests)
  const detailUrl = `/properties/${property.id}${
    Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : ''
  }`

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 1
  const totalPrice = (property.price ?? 0) * nights
  const isFavoriteAmongGuests = (property.averageRating ?? 0) >= 4.8 && (property.totalReviews ?? 0) >= 5

  return (
    <Link href={detailUrl}>
      <article className="group">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
          {card.images[0] && (
            <Image
              src={card.images[0]}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          )}
          {isFavoriteAmongGuests && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-white rounded-lg text-xs font-semibold shadow-sm">
              Favorito entre huéspedes
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-secondary truncate">{property.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-current text-secondary" />
              <span className="text-sm">{(property.averageRating ?? 0).toFixed(2)}</span>
              {property.totalReviews ? (
                <span className="text-sm text-gray-500">({property.totalReviews})</span>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {property.city}, {property.country}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">{totalPrice.toLocaleString()} €</span>
            <span className="text-gray-500">
              {' '}
              por {nights} {nights === 1 ? 'noche' : 'noches'}
            </span>
          </p>
        </div>
      </article>
    </Link>
  )
}

function SearchMapSection({
  properties,
  userLocation,
}: {
  properties: Property[]
  userLocation?: { lat: number; lng: number }
}) {
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation)
    } else if (properties.length > 0) {
      const valid = properties.filter((p) => p.latitude && p.longitude)
      if (valid.length > 0) {
        const lat = valid.reduce((a, p) => a + p.latitude, 0) / valid.length
        const lng = valid.reduce((a, p) => a + p.longitude, 0) / valid.length
        setCenter({ lat, lng })
      } else {
        setCenter({
          lat: properties[0]?.latitude ?? 0,
          lng: properties[0]?.longitude ?? 0,
        })
      }
    }
  }, [properties, userLocation])

  const SearchMap = dynamic(() => import('@/components/search/search-map'), {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        Cargando mapa...
      </div>
    ),
  })

  if (properties.length === 0) return null

  return (
    <SearchMap
      properties={properties}
      center={center}
    />
  )
}
