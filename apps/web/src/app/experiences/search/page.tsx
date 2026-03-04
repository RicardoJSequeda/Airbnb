'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ExperiencesList from '@/components/experiences/experiences-list'
import { useExperiencesList } from '@/features/experiences/hooks'
import { serviceCategories } from '@/components/services/data'
import ServiceCategoryList from '@/components/services/ServiceCategoryList'

const CONTAINER_CLASS =
  'max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12'

// Relación categorías técnicas → categorías visibles de servicio
const EXPERIENCE_TO_SERVICE_CATEGORY: Record<string, string> = {
  tasting: 'chefs',
  adventure: 'entrenamiento',
  workshop: 'fotografia',
}

function getServiceCategoryByExperienceCategory(experienceCategory: string) {
  const serviceId = EXPERIENCE_TO_SERVICE_CATEGORY[experienceCategory]
  if (!serviceId) return null
  return serviceCategories.find((c) => c.id === serviceId) ?? null
}

function ExperiencesSearchContent() {
  const searchParams = useSearchParams()
  const city = searchParams.get('city') ?? ''
  const dateType = searchParams.get('dateType') ?? ''
  const category = searchParams.get('category') ?? ''
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const adults = parseInt(searchParams.get('adults') ?? '0', 10)
  const children = parseInt(searchParams.get('children') ?? '0', 10)
  const babies = parseInt(searchParams.get('babies') ?? '0', 10)
  const totalParticipants = adults + children + babies
  const fromParam = searchParams.get('from')
  const serviceTypeParam = searchParams.get('serviceType')
  const fromServices = fromParam === 'services' || !!serviceTypeParam
  const fullQuery = searchParams.toString()
  const baseFilters = {
    city: city || undefined,
    minParticipants: totalParticipants > 0 ? totalParticipants : undefined,
    listingType: (fromServices ? 'service' : 'experience') as 'service' | 'experience',
  }

  // Resultados filtrados según la búsqueda actual (categoría, ciudad, fechas, etc.)
  const {
    experiences,
    loading,
    error,
  } = useExperiencesList({
    ...baseFilters,
    category: category || undefined,
  })

  // Experiencias solo por ciudad/participantes para calcular la disponibilidad por categoría (carrusel superior)
  const {
    experiences: experiencesForCategories = [],
  } = useExperiencesList(baseFilters)

  const getSearchTitle = () => {
    const serviceCategory = category ? getServiceCategoryByExperienceCategory(category) : null

    if (serviceCategory && city) {
      return `${serviceCategory.name} en ${city}`
    }

    if (dateType === 'today') return 'Experiencias para hoy'
    if (dateType === 'tomorrow') return 'Mañana en ' + (city || 'Bogotá')
    if (dateType === 'weekend') return 'Experiencias este fin de semana'
    if (city) return `Experiencias en ${city}`
    return 'Experiencias disponibles'
  }

  // Agrupar experiencias por categoría de servicio visible para el carrusel
  const categoriesWithAvailability = serviceCategories.map((serviceCategory) => {
    const filtered = experiencesForCategories.filter(
      (experience) =>
        EXPERIENCE_TO_SERVICE_CATEGORY[experience.category] === serviceCategory.id,
    )
    const count = filtered.length
    let availability = 'Próximamente'

    if (count === 1) {
      availability = '1 disponible'
    } else if (count > 1) {
      availability = `${count} disponibles`
    }

    return {
      ...serviceCategory,
      availability,
    }
  })

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="h-20" />
        <div className={`${CONTAINER_CLASS} py-12`}>
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
        <div className={`${CONTAINER_CLASS} py-12`}>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const serviceCategory = category
    ? getServiceCategoryByExperienceCategory(category)
    : null
  const displayCategoryName = serviceCategory?.name ?? 'este servicio'
  const cityLabel = city || 'tu zona'

  // VISTA EXPERIENCIAS (módulo experiencias): layout tipo carruseles por secciones
  if (!fromServices) {
    const hasExperiences = experiences.length > 0
    const mainList = experiences
    const secondaryList = experiences.length > 4 ? experiences.slice().reverse() : experiences

    return (
      <main className="min-h-screen bg-white">
        <Header />
        {/* Un poco más de espacio entre el header y el título de experiencias */}
        <div className="h-24" />

        <div className={`${CONTAINER_CLASS} pb-16`}>
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222]">
              {city ? `Experiencias en ${city}` : 'Experiencias recomendadas'}
            </h1>
            <p className="mt-1 text-sm md:text-base text-[#717171]">
              Basadas en actividades populares realizadas por huéspedes en la zona.
            </p>
          </header>

          {hasExperiences ? (
            <div className="space-y-10">
              <ExperiencesList
                experiences={mainList}
                title="Cultura e historia de la zona"
              />

              {secondaryList.length > 0 && (
                <ExperiencesList
                  experiences={secondaryList}
                  title="Los mejores sabores locales"
                  showArrow
                />
              )}
            </div>
          ) : (
            <div className="py-12">
              <div className="text-center py-16">
                <p className="text-lg text-secondary">No se encontraron experiencias</p>
                <p className="text-sm text-gray-500 mt-1">
                  Intenta ajustar tus filtros de búsqueda
                </p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    )
  }

  // VISTA SERVICIOS (fromServices=true): reutiliza layout actual de servicios
  return (
    <main className="min-h-screen">
      <Header />
      <div className="h-20" />

       {/* Carrusel de categorías de servicios para navegar rápidamente entre tipos de servicio */}
      <ServiceCategoryList
        title={city ? `Servicios en ${city}` : 'Servicios disponibles'}
        categories={categoriesWithAvailability}
        city={city || 'Bogotá'}
      />

      {experiences.length > 0 ? (
        <ExperiencesList
          experiences={experiences}
          title={getSearchTitle()}
          fromServicesQuery={fromServices ? fullQuery : undefined}
          useServicesRoute={fromServices}
        />
      ) : category ? (
        <div className={`${CONTAINER_CLASS} py-12`}>
          <div className="grid grid-cols-1 gap-8 rounded-3xl bg-white p-6 md:grid-cols-2 md:p-10 items-center">
            <div className="flex justify-center md:justify-start">
              {serviceCategory ? (
                <img
                  src={serviceCategory.imageUrl}
                  alt={serviceCategory.name}
                  className="max-h-[260px] w-auto rounded-3xl object-contain"
                />
              ) : (
                <div className="h-[220px] w-[220px] rounded-3xl bg-gray-100" />
              )}
            </div>
            <div className="md:pl-6">
              <p className="text-2xl md:text-3xl font-semibold text-[#222222]">
                {`El servicio de ${displayCategoryName.toLowerCase()} pronto estará disponible en ${cityLabel}`}
              </p>
              <p className="mt-3 text-sm md:text-base text-[#6A6A6A]">
                {`Prueba eligiendo otro servicio o cambia la ubicación para buscar ${displayCategoryName.toLowerCase()} en otras zonas.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${CONTAINER_CLASS} py-12`}>
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
