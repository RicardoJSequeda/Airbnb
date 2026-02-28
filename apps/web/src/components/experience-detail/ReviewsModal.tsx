'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Star, Search, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ExperienceReview } from '@/types/experience'

interface ReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  averageRating: number
  totalReviews: number
  reviews: ExperienceReview[]
}

const MAX_PREVIEW_LENGTH = 200

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1).replace('.', ',') : '0,0'
}

function ReviewCard({ review }: { review: ExperienceReview }) {
  const [expanded, setExpanded] = useState(false)
  const name = review.guest?.name ?? 'Invitado'
  const needsExpand = review.comment.length > MAX_PREVIEW_LENGTH
  const text = needsExpand && !expanded
    ? `${review.comment.slice(0, MAX_PREVIEW_LENGTH)}...`
    : review.comment
  const dateStr = review.createdAt
    ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: es })
    : ''

  return (
    <div className="border-t border-neutral-200 pt-6 first:pt-0 first:border-t-0">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-neutral-700 font-semibold">
          {review.guest?.avatar ? (
            <Image
              src={review.guest.avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900">{name}</span>
            <span className="text-sm text-neutral-600">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating ? 'fill-neutral-900 text-neutral-900' : 'fill-gray-200 text-gray-200'
                }`}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="mt-2 text-neutral-900 text-sm leading-relaxed whitespace-pre-line">
            {text}
          </p>
          {needsExpand && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 text-sm font-medium text-neutral-900 underline hover:no-underline"
            >
              Conoce más
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewsModal({
  isOpen,
  onClose,
  averageRating,
  totalReviews,
  reviews,
}: ReviewsModalProps) {
  const [search, setSearch] = useState('')

  const ratingStr = formatRating(averageRating)
  const reviewsLabel = totalReviews === 1 ? 'reseña' : 'reseñas'

  const filteredReviews = search.trim()
    ? reviews.filter(
        (r) =>
          r.comment.toLowerCase().includes(search.toLowerCase()) ||
          (r.guest?.name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : reviews

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-neutral-900" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-neutral-900">
                {ratingStr} · {totalReviews} {reviewsLabel}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
            </button>
          </div>

          {/* Ordenar */}
          <div className="px-4 pt-2 flex-shrink-0">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-neutral-900"
            >
              Las más recientes <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Buscador */}
          <div className="px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2">
              <Search className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Busca todas las reseñas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-0 text-sm text-neutral-900 placeholder:text-neutral-500 outline-none border-none"
              />
            </div>
          </div>

          {/* Lista de reseñas */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {filteredReviews.length === 0 ? (
              <p className="text-neutral-600 text-sm py-6">
                {search.trim() ? 'No hay reseñas que coincidan con la búsqueda.' : 'Aún no hay reseñas.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
