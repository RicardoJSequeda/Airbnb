'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ExperiencesList from '@/components/experiences/experiences-list'
import { publicExperiencesApi } from '@/lib/api/experiences'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Experience } from '@/types/experience'

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    publicExperiencesApi
      .getAll({ city: 'Bogotá', country: 'Colombia' })
      .then(setExperiences)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar experiencias')))
      .finally(() => setLoading(false))
  }, [])

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
    <main className="min-h-screen bg-white">
      <Header />
      {/* Espaciado simétrico: similar al espacio entre nav y buscador (referencia) */}
      <div className="h-8 md:h-9" />
      
      {experiences.length > 0 ? (
        <>
          <ExperiencesList
            experiences={experiences}
            title="Experiencias populares en Bogotá"
            isFirstSection
          />
          <ExperiencesList
            experiences={[...experiences].reverse()}
            title="Airbnb Originals"
            subtitle="Organizadas por las personas más interesantes del mundo"
            showArrow
          />
        </>
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
