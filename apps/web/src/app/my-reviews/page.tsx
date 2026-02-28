'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ReviewCard from '@/components/reviews/review-card'
import EditReviewModal from '@/components/reviews/edit-review-modal'
import { reviewsApi } from '@/lib/api/reviews'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import { toast } from 'sonner'
import type { Review } from '@/types'

export default function MyReviewsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  useEffect(() => {
    if (!isAuthenticated) openLoginModal('/my-reviews')
  }, [isAuthenticated, openLoginModal])

  useEffect(() => {
    if (!isAuthenticated) return

    reviewsApi
      .getMyReviews()
      .then(setReviews)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar')))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    try {
      await reviewsApi.delete(id)
      toast.success('Reseña eliminada')
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      toast.error(parseErrorMessage(err, 'Error al eliminar'))
    }
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[800px] mx-auto px-6 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-[800px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-secondary mb-6">
          Mis reseñas
        </h1>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!error && reviews.length === 0 && (
          <div className="text-center py-12 text-secondary">
            <p className="mb-4">Aún no has dejado ninguna reseña.</p>
            <Link href="/my-bookings" className="text-primary font-medium hover:underline">
              Ver mis reservas
            </Link>
          </div>
        )}

        {!error && reviews.length > 0 && (
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="p-4 border border-gray-200 rounded-xl bg-white"
              >
                <div className="flex gap-4">
                  {review.property?.images?.[0] && (
                    <Link
                      href={`/properties/${review.propertyId}`}
                      className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden"
                    >
                      <Image
                        src={review.property.images[0]}
                        alt={review.property?.title ?? 'Propiedad'}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/properties/${review.propertyId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {review.property?.title ?? 'Propiedad'}
                    </Link>
                    {review.property?.city && (
                      <p className="text-sm text-secondary">
                        {review.property.city}
                        {review.property?.country && `, ${review.property.country}`}
                      </p>
                    )}
                    <div className="mt-2">
                      <ReviewCard review={review} />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingReview(review)}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <EditReviewModal
          open={!!editingReview}
          onClose={() => setEditingReview(null)}
          review={editingReview}
          onSuccess={() => {
            setEditingReview(null)
            reviewsApi.getMyReviews().then(setReviews)
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
