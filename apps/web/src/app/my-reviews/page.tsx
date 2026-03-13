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
import { ChevronRight } from 'lucide-react'

export default function MyReviewsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [activeTab, setActiveTab] = useState<'about_you' | 'by_you'>('about_you')

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

      <main className="max-w-[1032px] mx-auto px-6 py-8">
        <div className="mb-8 flex items-center text-[13px] text-neutral-500 font-medium">
          <Link href="/profile" className="hover:underline text-[#222222]">Perfil</Link>
          <ChevronRight className="w-[14px] h-[14px] mx-1" strokeWidth={2} />
          <span>Reseñas</span>
        </div>

        <h1 className="text-3xl font-semibold text-[#222222] mb-10">
          {activeTab === 'about_you' ? 'Reseñas sobre ti' : 'Reseñas que escribiste'}
        </h1>

        <div className="flex gap-6 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('about_you')}
            className={`pb-4 font-medium text-[15px] transition-colors relative ${activeTab === 'about_you' ? 'text-[#222222]' : 'text-[#717171] hover:text-[#222222]'}`}
          >
            Reseñas sobre ti
            {activeTab === 'about_you' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('by_you')}
            className={`pb-4 font-medium text-[15px] transition-colors relative ${activeTab === 'by_you' ? 'text-[#222222]' : 'text-[#717171] hover:text-[#222222]'}`}
          >
            Reseñas que escribiste
            {activeTab === 'by_you' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#222222]" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!error && activeTab === 'about_you' && (
          <div>
            <h2 className="text-xl font-semibold text-[#222222] mb-2">
              Reseñas anteriores
            </h2>
            <p className="text-[#222222] pt-1 text-[15px]">Nadie te ha escrito una reseña aún.</p>
          </div>
        )}

        {!error && activeTab === 'by_you' && (
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-semibold text-[#222222] mb-2">
                Reseñas que tienes que escribir
              </h2>
              <p className="text-[#222222] max-w-3xl pt-1 text-[15px]">
                No hay reseñas pendientes por escribir en este momento. ¡Parece que llegó la hora de planear un nuevo viaje!
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#222222] mb-4">
                Reseñas anteriores que escribiste
              </h2>
              {reviews.length === 0 ? (
                <p className="text-[#222222] text-[15px]">
                  Todavía no has escrito ninguna reseña.
                </p>
              ) : (
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
                            className="font-medium text-[#222222] hover:underline"
                          >
                            {review.property?.title ?? 'Propiedad'}
                          </Link>
                          {review.property?.city && (
                            <p className="text-sm text-[#717171]">
                              {review.property.city}
                              {review.property?.country && `, ${review.property.country}`}
                            </p>
                          )}
                          <div className="mt-2 text-[#222222]">
                            <ReviewCard review={review} />
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingReview(review)}
                              className="text-sm font-medium hover:underline text-[#222222]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(review.id)}
                              className="text-sm hover:underline text-red-600"
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
            </div>
          </div>
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
