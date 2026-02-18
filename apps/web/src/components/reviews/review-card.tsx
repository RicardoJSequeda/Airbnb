'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Review } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const displayName = review.guest?.name ?? 'Usuario'
  const date = review.createdAt
    ? format(new Date(review.createdAt), "d 'de' MMMM yyyy", { locale: es })
    : ''

  return (
    <div className="border-t border-gray-200 pt-6 first:pt-0 first:border-t-0">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-secondary font-semibold">
          {review.guest?.avatar ? (
            <Image
              src={review.guest.avatar}
              alt={displayName}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <span>{displayName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-secondary">{displayName}</span>
            <span className="text-sm text-gray-500">{date}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? 'fill-primary text-primary'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          {review.comment && (
            <p className="mt-2 text-secondary text-sm">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  )
}
