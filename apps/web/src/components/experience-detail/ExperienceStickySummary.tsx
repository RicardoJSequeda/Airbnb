'use client'

import Image from 'next/image'
import { Heart, Share2, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import ShareModal from './ShareModal'
import CreateFavoriteListModal from './CreateFavoriteListModal'
import ExperienceBookingCard, { type ExperienceSlot } from './ExperienceBookingCard'

interface ExperienceStickySummaryProps {
  experienceId: string
  title: string
  imageUrl?: string
  hostName?: string
  hostAvatar?: string | null
  hostOccupation?: string | null
  city: string
  category?: string
  meetingPoint?: string | null
  averageRating: number
  totalReviews: number
  isFavorite: boolean
  onFavoriteToggle: () => void
  pricePerParticipant: number
  currency: string
  originalPrice?: number
  slots: ExperienceSlot[]
  onShowDates: () => void
}

function formatRating(averageRating: number) {
  return averageRating > 0 ? averageRating.toFixed(1).replace('.', ',') : '0,0'
}

export default function ExperienceStickySummary({
  experienceId,
  title,
  imageUrl,
  hostName,
  hostAvatar,
  hostOccupation,
  city,
  category,
  meetingPoint,
  averageRating,
  totalReviews,
  isFavorite,
  onFavoriteToggle,
  pricePerParticipant,
  currency,
  originalPrice,
  slots,
  onShowDates,
}: ExperienceStickySummaryProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [favoriteListModalOpen, setFavoriteListModalOpen] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const ratingStr = formatRating(averageRating)
  const reviewsStr = totalReviews === 1 ? 'reseña' : 'reseñas'

  const initials = useMemo(() => {
    const n = (hostName ?? '').trim()
    if (!n) return 'A'
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }, [hostName])

  const handleShare = async () => {
    if (typeof navigator?.share === 'function') {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setShareModalOpen(true)
        return
      }
    }
    setShareModalOpen(true)
  }

  const handleFavoriteClick = () => {
    if (!isFavorite) setFavoriteListModalOpen(true)
    else onFavoriteToggle()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Imagen principal + avatar */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 max-h-[230px]">
        <div className="relative aspect-[16/10] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 460px, 100vw"
              priority
            />
          ) : null}
        </div>

        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
          <div className="h-14 w-14 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
            {hostAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hostAvatar} alt={hostName ?? 'Anfitrión'} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-neutral-700">{initials}</span>
            )}
          </div>
        </div>
      </div>

      {/* Jerarquía de información compacta (cabe en una pantalla) */}
      <div className="pt-7 text-center">
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>

        {(hostOccupation || hostName) && (
          <p className="mt-1.5 text-xs text-neutral-600">
            {hostOccupation ?? `Anfitrión: ${hostName}`}
          </p>
        )}

        <div className="mt-2 text-xs text-neutral-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-neutral-900" aria-hidden />
            <span className="font-medium">{ratingStr}</span>
          </span>
          <span className="text-neutral-400" aria-hidden>·</span>
          <span>
            {totalReviews} {reviewsStr}
          </span>
          {category ? (
            <>
              <span className="text-neutral-400" aria-hidden>·</span>
              <span>{category} en {city}</span>
            </>
          ) : (
            <>
              <span className="text-neutral-400" aria-hidden>·</span>
              <span>{city}</span>
            </>
          )}
        </div>

        {meetingPoint ? (
          <p className="mt-1 text-[11px] text-neutral-500">
            Se ofrece en {meetingPoint}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Compartir"
          >
            <Share2 className="h-5 w-5 text-neutral-700" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar'}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Tarjeta de reserva (reutilizada) */}
      <div>
        <ExperienceBookingCard
          experienceId={experienceId}
          pricePerParticipant={pricePerParticipant}
          currency={currency}
          originalPrice={originalPrice}
          slots={slots}
          onShowDates={onShowDates}
        />
      </div>

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
        onSuccess={() => {
          onFavoriteToggle()
        }}
      />
    </div>
  )
}

