'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import ExperienceCard from './experience-card'
import type { Experience } from '@/types/experience'

interface ExperiencesListProps {
  experiences: Experience[]
  title: string
  subtitle?: string
  showArrow?: boolean
}

/** Misma estructura que PropertyCarousel: section + fila título/flechas + contenedor scroll, con max-w y padding idénticos. */
export default function ExperiencesList({
  experiences,
  title,
  subtitle,
  showArrow,
}: ExperiencesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (!container) return
    container.addEventListener('scroll', checkScroll, { passive: true })
    return () => container.removeEventListener('scroll', checkScroll)
  }, [checkScroll, experiences.length])

  if (experiences.length === 0) return null

  const CONTAINER_CLASS = 'w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12'

  return (
    <section className="relative w-full min-w-0">
      {/* Fila título + flechas: mismo contenedor centrado que Alojamientos */}
      <div className={`flex items-center justify-between ${CONTAINER_CLASS} mb-4`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-semibold text-secondary">{title}</h2>
            {showArrow && (
              <Link
                href="/experiences"
                className="text-secondary hover:underline flex items-center"
                aria-label="Ver más"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              w-8 h-8 rounded-full bg-white border border-border-secondary
              flex items-center justify-center
              transition-all duration-200
              ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-105 cursor-pointer'}
            `}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-secondary" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              w-8 h-8 rounded-full bg-white border border-border-secondary
              flex items-center justify-center
              transition-all duration-200
              ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-105 cursor-pointer'}
            `}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {/* Contenedor del scroll: mismo max-w y padding que el carrusel de propiedades */}
      <div className={`relative w-full ${CONTAINER_CLASS}`}>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory touch-pan-x min-w-0 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="
                flex-shrink-0 snap-start
                w-[calc(50%-8px)] min-w-[140px]
                sm:w-[calc(33.333%-11px)]
                md:w-[calc(25%-12px)]
                lg:w-[calc(14.285%-14px)]
                xl:w-[247px]
              "
            >
              <ExperienceCard experience={experience} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
