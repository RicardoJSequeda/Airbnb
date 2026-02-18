'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ExperienceReview } from '@/types/experience'

interface ExperienceReviewsSectionProps {
  averageRating: number
  totalReviews: number
  reviews: ExperienceReview[]
}

const MAX_PREVIEW_LENGTH = 200

export default function ExperienceReviewsSection({
  averageRating,
  totalReviews,
  reviews,
}: ExperienceReviewsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-secondary text-secondary" />
        <h2 className="text-xl font-semibold text-secondary">
          {averageRating > 0 ? averageRating.toFixed(2).replace('.', ',') : '—'} · {totalReviews}{' '}
          {totalReviews === 1 ? 'reseña' : 'reseñas'}
        </h2>
      </div>

      {reviews.length === 0 ? (
        <p className="text-text-2 text-sm">Aún no hay reseñas.</p>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => (
            <ExperienceReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}

function ExperienceReviewCard({ review }: { review: ExperienceReview }) {
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
    <div className="border-t border-gray-200 pt-6 first:pt-0 first:border-t-0">
      <div className="flex gap-4">
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-secondary font-semibold">
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
            <span className="font-semibold text-secondary">{name}</span>
            <span className="text-sm text-text-2">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating ? 'fill-secondary text-secondary' : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-secondary text-sm leading-relaxed whitespace-pre-line">
            {text}
          </p>
          {needsExpand && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 text-sm font-medium text-secondary underline hover:no-underline"
            >
              Conoce más
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
