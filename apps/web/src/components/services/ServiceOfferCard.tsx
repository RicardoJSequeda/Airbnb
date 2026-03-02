import { Heart } from 'lucide-react'
import type { ServiceOffer } from './types'

interface ServiceOfferCardProps {
  offer: ServiceOffer
}

export default function ServiceOfferCard({ offer }: ServiceOfferCardProps) {
  return (
    <article className="w-[290px] shrink-0">
      <div className="relative">
        <img
          src={offer.imageUrl}
          alt={offer.title}
          className="h-[245px] w-full rounded-[24px] object-cover"
        />
        {offer.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#222222]">
            {offer.badge}
          </span>
        ) : null}
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm"
          aria-label={`Guardar ${offer.title}`}
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <h3 className="mt-3 text-xl font-medium leading-tight text-[#222222]">{offer.title}</h3>
      <p className="text-base text-[#6A6A6A]">{offer.city}</p>
      <p className="text-base text-[#6A6A6A]">{offer.price}</p>
      {offer.minimum ? <p className="text-base text-[#6A6A6A]">{offer.minimum}</p> : null}
      {offer.ratingText ? <p className="text-base text-[#6A6A6A]">· {offer.ratingText}</p> : null}
    </article>
  )
}
