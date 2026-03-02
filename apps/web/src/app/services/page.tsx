'use client'

import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ExperiencesList from '@/components/experiences/experiences-list'
import ServiceCategoryList from '@/components/services/ServiceCategoryList'
import { serviceCategories } from '@/components/services/data'
import { useExperiencesList } from '@/features/experiences/hooks'

// Mapea categorías técnicas de experiencias → categorías visibles de servicios
const EXPERIENCE_TO_SERVICE_CATEGORY: Record<string, string> = {
  tasting: 'chefs',
  adventure: 'entrenamiento',
  workshop: 'fotografia',
}

// Mapea categorías de servicio (id) → categoría técnica del backend
const SERVICE_TO_EXPERIENCE_CATEGORY: Record<string, string> = {
  fotografia: 'workshop',
  chefs: 'tasting',
  comidas: 'tasting',
  entrenamiento: 'adventure',
}

const CONTAINER_CLASS =
  'w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12'

export default function ServicesPage() {
  const searchParams = useSearchParams()

  const city = searchParams.get('city') ?? 'Bogotá'
  const serviceType = searchParams.get('serviceType') ?? null
  const adults = parseInt(searchParams.get('adults') ?? '0', 10)
  const children = parseInt(searchParams.get('children') ?? '0', 10)
  const babies = parseInt(searchParams.get('babies') ?? '0', 10)
  const totalParticipants = adults + children + babies

  const experienceCategory = serviceType
    ? SERVICE_TO_EXPERIENCE_CATEGORY[serviceType] ?? undefined
    : undefined

  const { experiences, loading, error } = useExperiencesList({
    city,
    category: experienceCategory,
    minParticipants: totalParticipants > 0 ? totalParticipants : undefined,
  })

  // Agrupar experiencias por categoría de servicio visible
  const experiencesByServiceCategory = serviceCategories.map((category) => {
    const filtered = experiences.filter(
      (experience) =>
        EXPERIENCE_TO_SERVICE_CATEGORY[experience.category] === category.id,
    )

    return {
      category,
      experiences: filtered,
    }
  })

  // Cálculo dinámico del texto de disponibilidad por categoría y ubicación
  const categoriesWithAvailability = experiencesByServiceCategory.map(
    ({ category, experiences }) => {
      const count = experiences.length
      let availability = 'Próximamente'

      if (count === 1) {
        availability = '1 disponible'
      } else if (count > 1) {
        availability = `${count} disponibles`
      }

      return {
        ...category,
        availability,
      }
    },
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* Menos espacio entre el header y el contenido en Servicios */}
      <div className="h-10" />

      <section className="bg-[#F7F7F7] pb-10">
        {/* Carrusel de categorías como en el diseño oficial */}
        <ServiceCategoryList
          title="Servicios disponibles"
          categories={categoriesWithAvailability}
          city={city}
        />

        <div className="mx-auto w-full max-w-[1600px] px-6 mt-4 pb-2">
          <h2 className="text-2xl font-medium tracking-tight text-[#222222] md:text-4xl">
            Descubre los servicios disponibles en Airbnb
          </h2>
          <p className="mt-2 text-base text-[#6A6A6A]">
            Basados en experiencias reales organizadas por anfitriones profesionales.
          </p>
        </div>

        {/* Estado de carga / error con el mismo estilo que la página de experiencias */}
        {loading ? (
          <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 py-12">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : experiences.length > 0 ? (
          <div className="w-full space-y-10 py-8">
            {experiencesByServiceCategory
              .filter(({ experiences }) => experiences.length > 0)
              .map(({ category, experiences }) => (
                <ExperiencesList
                  key={category.id}
                  experiences={experiences}
                  title={category.name}
                />
              ))}
          </div>
        ) : (
          <div className={`${CONTAINER_CLASS} py-12`}>
            <div className="text-center py-16">
              <p className="text-lg text-secondary">
                No hay servicios disponibles todavía
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Prueba más tarde o usa el buscador para explorar experiencias
                en otras ciudades.
              </p>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
