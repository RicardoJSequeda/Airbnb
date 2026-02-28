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
    <section className="border-t border-neutral-200 pt-8 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 fill-neutral-900" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-neutral-900">
          {averageRating > 0 ? averageRating.toFixed(1).replace('.', ',') : '0,0'} · {totalReviews}{' '}
          {totalReviews === 1 ? 'reseña' : 'reseñas'}
        </h2>
      </div>

      {reviews.length === 0 ? (
        <p className="text-neutral-600 text-sm">Aún no hay reseñas.</p>
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
              className="mt-1 text-sm font-medium text-neutral-900 underline hover:no-underline transition-all duration-150 ease-out"
            >
              Conoce más
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
