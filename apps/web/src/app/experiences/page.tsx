'use client'

import { useMemo, useState } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ExperiencesList from '@/components/experiences/experiences-list'
import { useExperiencesList } from '@/features/experiences/hooks'

const CITIES_PER_BATCH = 4
const MAX_EXPERIENCES_PER_CITY = 12
const MAX_ORIGINALS = 16

export default function ExperiencesPage() {
  // Cargamos todas las experiencias del módulo experiencias (sin filtrar por ciudad).
  const { experiences, loading, error } = useExperiencesList({
    listingType: 'experience',
  })

  const [visibleBatches, setVisibleBatches] = useState(1)

  const { cityGroups, originals } = useMemo(() => {
    const byCity = new Map<string, typeof experiences>()

    for (const exp of experiences) {
      const city = (exp.city || 'Otros').trim()
      if (!byCity.has(city)) byCity.set(city, [])
      byCity.get(city)!.push(exp)
    }

    const sortedCities = Array.from(byCity.entries()).sort(
      (a, b) => b[1].length - a[1].length,
    )

    const originalsSorted = [...experiences].sort(
      (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
    )

    return {
      cityGroups: sortedCities,
      originals: originalsSorted,
    }
  }, [experiences])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="h-20" />
        <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="h-20" />
        <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const visibleCityGroups = cityGroups.slice(0, visibleBatches * CITIES_PER_BATCH)
  const hasMoreCities = visibleCityGroups.length < cityGroups.length

  const originalsSlice = originals.slice(0, MAX_ORIGINALS)

  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* Mismo espaciado que home: nav → contenido */}
      <div className="h-50" />

      {experiences.length > 0 ? (
        <div className="w-full space-y-10 py-8">
          {visibleCityGroups.map(([city, exps]) => (
            <ExperiencesList
              key={city}
              experiences={exps.slice(0, MAX_EXPERIENCES_PER_CITY)}
              title={`Experiencias en ${city}`}
              showArrow
            />
          ))}

          {originalsSlice.length > 0 && (
            <ExperiencesList
              experiences={originalsSlice}
              title="Airbnb Originals"
              subtitle="Organizadas por las personas más interesantes del mundo"
              showArrow
            />
          )}

          {hasMoreCities && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleBatches((n) => n + 1)}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-[#222222] hover:bg-gray-50 transition-colors"
              >
                Ver más ciudades
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
          <div className="text-center py-16">
            <p className="text-lg text-secondary">No hay experiencias disponibles</p>
            <p className="text-sm text-gray-500 mt-1">
              Organizadas por las personas más interesantes del mundo
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
