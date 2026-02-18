'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import ExperienceCard from './experience-card'
import type { Experience } from '@/types/experience'

interface ExperiencesListProps {
  experiences: Experience[]
  title: string
  subtitle?: string
  showArrow?: boolean
  /** Más padding superior en la primera sección (espaciado buscador ↔ contenido) */
  isFirstSection?: boolean
}

export default function ExperiencesList({
  experiences,
  title,
  subtitle,
  showArrow,
  isFirstSection,
}: ExperiencesListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (experiences.length === 0) return null

  return (
    <div
      className={`max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 ${isFirstSection ? 'pt-10 pb-10' : 'py-10'}`}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-secondary">{title}</h2>
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
            <p className="text-sm text-text-2 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {experiences.map((experience) => (
          <div key={experience.id} className="flex-shrink-0 w-[300px]">
            <ExperienceCard experience={experience} />
          </div>
        ))}
      </div>
    </div>
  )
}
