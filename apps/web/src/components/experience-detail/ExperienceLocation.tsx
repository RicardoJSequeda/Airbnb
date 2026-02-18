'use client'

import PropertyMap from '@/components/property-detail/property-map'

interface ExperienceLocationProps {
  title: string
  address: string
  city: string
  latitude: number
  longitude: number
}

export default function ExperienceLocation(props: ExperienceLocationProps) {
  const { title, address, city, latitude, longitude } = props
  const locationLabel = address || city
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-secondary">Dónde nos encontraremos</h2>
      <p className="text-text-2">{locationLabel}</p>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <PropertyMap latitude={latitude} longitude={longitude} address={address} title={title} />
      </div>
    </section>
  )
}
