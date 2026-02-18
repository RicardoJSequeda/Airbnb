'use client'

import { Star, Share2, Heart } from 'lucide-react'

interface ExperienceHeroProps {
  title: string
  averageRating: number
  totalReviews: number
  category: string
  city: string
  isFavorite?: boolean
  onFavoriteToggle?: () => void
}

/** Título, valoración, categoría e iconos compartir/guardar (referencia). */
export default function ExperienceHero({
  title,
  averageRating,
  totalReviews,
  category,
  city,
  isFavorite = false,
  onFavoriteToggle,
}: ExperienceHeroProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl md:text-3xl font-semibold text-secondary leading-tight">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 fill-secondary text-secondary" />
          <span className="font-semibold text-secondary">
            {averageRating > 0 ? averageRating.toFixed(2).replace('.', ',') : '—'}
          </span>
          <span className="text-secondary">
            · {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
          </span>
        </div>
        <span className="text-text-2 text-sm">
          {city} · {category}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Compartir"
        >
          <Share2 className="w-5 h-5 text-secondary" />
        </button>
        <button
          type="button"
          onClick={onFavoriteToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-primary text-primary' : 'text-secondary'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
