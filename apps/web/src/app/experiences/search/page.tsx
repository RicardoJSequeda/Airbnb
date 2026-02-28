'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ExperiencesList from '@/components/experiences/experiences-list'
import { useExperiencesList } from '@/features/experiences/hooks'

function ExperiencesSearchContent() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') ?? ''
  const dateType = searchParams.get('dateType') ?? ''
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const adults = parseInt(searchParams.get('adults') ?? '0', 10)
  const children = parseInt(searchParams.get('children') ?? '0', 10)
  const babies = parseInt(searchParams.get('babies') ?? '0', 10)
  const totalParticipants = adults + children + babies

  const { experiences, loading, error } = useExperiencesList({
    city: city || undefined,
    minParticipants: totalParticipants > 0 ? totalParticipants : undefined,
  })

  const getSearchTitle = () => {
    if (dateType === 'today') return 'Experiencias para hoy'
    if (dateType === 'tomorrow') return 'Mañana en ' + (city || 'Bogotá')
    if (dateType === 'weekend') return 'Experiencias este fin de semana'
    if (city) return `Experiencias en ${city}`
    return 'Experiencias disponibles'
  }

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

  return (
    <main className="min-h-screen">
      <Header />
      <div className="h-20" />

      {experiences.length > 0 ? (
        <ExperiencesList experiences={experiences} title={getSearchTitle()} />
      ) : (
        <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
          <div className="text-center py-16">
            <p className="text-lg text-secondary">No se encontraron experiencias</p>
            <p className="text-sm text-gray-500 mt-1">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

function ExperiencesSearchFallback() {
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

export default function ExperiencesSearchPage() {
  return (
    <Suspense fallback={<ExperiencesSearchFallback />}>
      <ExperiencesSearchContent />
    </Suspense>
  )
}
