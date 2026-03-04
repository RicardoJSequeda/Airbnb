'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { ServiceCategory } from './types'

interface ServiceCategoryListProps {
  title: string
  categories: ServiceCategory[]
  city: string
}

// Mapea categorías visibles de servicios → categorías técnicas usadas por el backend
const SERVICE_TO_EXPERIENCE_CATEGORY: Record<string, string> = {
  fotografia: 'workshop',
  chefs: 'tasting',
  comidas: 'tasting',
  entrenamiento: 'adventure',
}

export default function ServiceCategoryList({
  title,
  categories,
  city,
}: ServiceCategoryListProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isServicesContext = pathname?.startsWith('/services')

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 pt-6 pb-8">
      <h2 className="mb-4 text-[22px] md:text-[26px] font-medium tracking-tight text-[#222222]">
        {title}
      </h2>
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="w-[140px] md:w-[150px] shrink-0 text-left focus:outline-none"
            onClick={() => {
              const experienceCategory =
                SERVICE_TO_EXPERIENCE_CATEGORY[category.id] ?? category.id

              const params = new URLSearchParams({
                category: experienceCategory,
                city,
                from: isServicesContext ? 'services' : 'experiences',
                serviceType: experienceCategory,
              })

              const basePath = isServicesContext
                ? '/services/search'
                : '/experiences/search'

              router.push(`${basePath}?${params.toString()}`)
            }}
          >
            <article className="w-full cursor-pointer">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-[130px] w-full rounded-[16px] object-cover"
              />
              <h3 className="mt-2 text-[13px] font-semibold text-[#222222]">
                {category.name}
              </h3>
              <p className="text-[11px] text-[#6A6A6A]">
                {category.availability}
              </p>
            </article>
          </button>
        ))}
      </div>
    </section>
  )
}
