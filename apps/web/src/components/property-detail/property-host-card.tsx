'use client'

import Image from 'next/image'
import type { Property } from '@/types'

interface PropertyHostCardProps {
  property: Property
}

export default function PropertyHostCard({ property }: PropertyHostCardProps) {
  const host = property.host

  return (
    <div className="flex gap-4 py-6 border-t border-gray-200">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {host?.avatar ? (
          <Image
            src={host.avatar}
            alt={host.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-2xl font-semibold text-gray-500">
            {host?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-secondary">
          Anfitrión: {host?.name ?? 'Anfitrión'}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          {property.bedrooms} {property.bedrooms === 1 ? 'habitación' : 'habitaciones'} ·{' '}
          {property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}
        </p>
      </div>
    </div>
  )
}
