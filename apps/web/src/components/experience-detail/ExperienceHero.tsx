'use client'

import { useState } from 'react'
import { Star, Share2, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import ShareModal from './ShareModal'
import CreateFavoriteListModal from './CreateFavoriteListModal'
import ExperienceDescription from './ExperienceDescription'
import ReviewsModal from './ReviewsModal'
import type { ExperienceReview } from '@/types/experience'

interface ExperienceHeroProps {
  title: string
  /** Descripción (debajo del título, antes del rating) */
  description?: string
  /** Número de registro RNT (ej. "41491") */
  registrationNumber?: string
  averageRating: number
  totalReviews: number
  reviews?: ExperienceReview[]
  category: string
  city: string
  experienceId: string
  imageUrl?: string
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  languages?: string[]
}

/** Título, descripción, valoración en una línea e iconos compartir/guardar (referencia Airbnb). */
export default function ExperienceHero({
  title,
  description,
  registrationNumber,
  averageRating,
  totalReviews,
  reviews = [],
  category,
  city,
  experienceId,
  imageUrl,
  isFavorite = false,
  onFavoriteToggle,
  languages = [],
}: ExperienceHeroProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [favoriteListModalOpen, setFavoriteListModalOpen] = useState(false)
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  // Siempre mostrar números: 0,0 y 0 cuando no hay reseñas
  const ratingStr = averageRating > 0 ? averageRating.toFixed(1).replace('.', ',') : '0,0'
  const reviewsStr = totalReviews === 1 ? 'reseña' : 'reseñas'
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = async () => {
    if (typeof navigator?.share === 'function') {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback a modal si el usuario cancela o hay error
          setShareModalOpen(true)
        }
      }
    } else {
      // Desktop: mostrar modal completo
      setShareModalOpen(true)
    }
  }

  const handleFavoriteClick = () => {
    if (!isFavorite) {
      // Si no está en favoritos, abrir modal para crear lista
      setFavoriteListModalOpen(true)
    } else {
      // Si ya está en favoritos, simplemente quitar
      setIsAnimating(true)
      onFavoriteToggle?.()
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const handleFavoriteListCreated = (listName: string) => {
    setIsAnimating(true)
    onFavoriteToggle?.()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="space-y-3 flex flex-col items-center">
      {/* Título principal en NEGRILLA */}
      <h1 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-neutral-900 text-center">
        {title}
      </h1>

      {/* Descripción debajo del título, antes del rating */}
      {description && description.trim() && (
        <ExperienceDescription
          description={description}
          languages={languages}
          registrationNumber={registrationNumber}
        />
      )}

      {/* Valoración · reseñas y ciudad · categoría sin espacio entre ellos */}
      <div className="flex flex-col items-center gap-0 leading-none">
        <button
          type="button"
          onClick={() => setReviewsModalOpen(true)}
          className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0 text-sm text-neutral-700 hover:opacity-80 transition-opacity"
        >
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-neutral-900" aria-hidden />
            <span className="font-medium">{ratingStr}</span>
          </span>
          <span className="text-neutral-400" aria-hidden>•</span>
          <span className="underline">{totalReviews} {reviewsStr}</span>
        </button>
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0 text-sm text-neutral-700">
          <span>{city}</span>
          {category && (
            <>
              <span className="text-neutral-400" aria-hidden>·</span>
              <span>{category}</span>
            </>
          )}
        </div>
      </div>

      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        averageRating={averageRating}
        totalReviews={totalReviews}
        reviews={reviews}
      />

      {/* Botones de compartir y favorito DESPUÉS de la ubicación */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <motion.button
          type="button"
          onClick={handleShare}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors duration-150 ease-out relative"
          aria-label="Compartir"
        >
          <Share2 className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
        </motion.button>
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={title}
          rating={averageRating}
          imageUrl={imageUrl}
          url={shareUrl}
        />
        <CreateFavoriteListModal
          isOpen={favoriteListModalOpen}
          onClose={() => setFavoriteListModalOpen(false)}
          onSuccess={handleFavoriteListCreated}
        />
        <motion.button
          type="button"
          onClick={handleFavoriteClick}
          whileTap={{ scale: 0.9 }}
          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors duration-150 ease-out"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar'}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-600'
            }`}
            strokeWidth={1.5}
          />
        </motion.button>
      </div>
    </div>
  )
}
