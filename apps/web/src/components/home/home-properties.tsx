'use client'

import { useState, useEffect } from 'react'
import PropertyCarousel from './property-carousel'
import { publicPropertiesApi } from '@/lib/api/properties'
import { toPropertyCardDisplay } from '@/lib/utils/property-mapper'
import type { PropertyCardDisplay } from './property-carousel'

export default function HomeProperties() {
  const [properties, setProperties] = useState<PropertyCardDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicPropertiesApi
      .getAll()
      .then((data) => setProperties(Array.isArray(data) ? data.map(toPropertyCardDisplay) : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[251/239] bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
        <div className="text-center py-16">
          <p className="text-lg text-secondary">No hay propiedades disponibles</p>
          <p className="text-sm text-gray-500 mt-1">Vuelve más tarde para ver nuevos alojamientos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 py-8">
      <PropertyCarousel
        properties={properties}
        title="Alojamientos populares"
      />
      <PropertyCarousel
        properties={[...properties].reverse()}
        title="Destacados"
      />
    </div>
  )
}
