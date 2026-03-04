'use client'

import Image from 'next/image'
import { Heart, MapPin, Share2, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import ShareModal from './ShareModal'
import CreateFavoriteListModal from './CreateFavoriteListModal'
import ExperienceBookingCard, { type ExperienceSlot } from './ExperienceBookingCard'

interface ExperienceDetailSidebarProps {
  experienceId: string
  title: string
  description?: string | null
  hostName?: string
  hostAvatar?: string | null
  hostOccupation?: string | null
  city: string
  category?: string
  meetingPoint?: string | null
  address?: string | null
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

function formatRating(value: number) {
  return value > 0 ? value.toFixed(2).replace('.', ',') : '0,00'
}

export default function ExperienceDetailSidebar({
  experienceId,
  title,
  description,
  hostName,
  hostAvatar,
  hostOccupation,
  city,
  category,
  meetingPoint,
  address,
  averageRating,
  totalReviews,
  isFavorite,
  onFavoriteToggle,
  pricePerParticipant,
  currency,
  originalPrice,
  slots,
  onShowDates,
}: ExperienceDetailSidebarProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [favoriteListModalOpen, setFavoriteListModalOpen] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const ratingStr = formatRating(averageRating)
  const reviewsStr = totalReviews === 1 ? 'reseña' : 'reseñas'

  const initials = useMemo(() => {
    const n = (hostName ?? '').trim()
    if (!n) return 'A'
    return n.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
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

  const locationLine = meetingPoint || address || city

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px] font-semibold text-[#222222] leading-tight tracking-tight">
        {title}
      </h1>

      {description && (
        <p className="text-[16px] text-[#222222] leading-relaxed line-clamp-4">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-[#222222]">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-[#222222]" aria-hidden />
          <span className="font-medium">{ratingStr}</span>
        </span>
        <span className="text-neutral-400" aria-hidden>·</span>
        <span>{totalReviews} {reviewsStr}</span>
        <span className="text-neutral-400" aria-hidden>·</span>
        <span>{city}</span>
        {category && (
          <>
            <span className="text-neutral-400" aria-hidden>·</span>
            <span>{category}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Compartir"
        >
          <Share2 className="h-5 w-5 text-[#222222]" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar'}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[#222222]'}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {hostName && (
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-neutral-200">
            {hostAvatar ? (
              <Image src={hostAvatar} alt={hostName} fill className="object-cover" sizes="48px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-600">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#222222]">Anfitrión: {hostName}</p>
            {hostOccupation && (
              <p className="mt-0.5 text-sm text-neutral-600">{hostOccupation}</p>
            )}
            <a
              href="#mensaje"
              className="mt-2 inline-block rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-[#222222] hover:bg-neutral-50 transition-colors"
            >
              Mensajea a {hostName.split(/\s+/)[0]}
            </a>
          </div>
        </div>
      )}

      {locationLine && (
        <div className="flex items-start gap-2 text-[15px] text-[#222222]">
          <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-medium">{meetingPoint || address || city}</p>
            {address && meetingPoint && address !== meetingPoint && (
              <p className="mt-0.5 text-neutral-600">{address}</p>
            )}
            <p className="mt-0.5 text-neutral-600">{city}</p>
          </div>
        </div>
      )}

      <div className="border-t border-[#EBEBEB] pt-6">
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
        imageUrl={undefined}
        url={shareUrl}
      />
      <CreateFavoriteListModal
        isOpen={favoriteListModalOpen}
        onClose={() => setFavoriteListModalOpen(false)}
        onSuccess={() => onFavoriteToggle()}
      />
    </div>
  )
}
