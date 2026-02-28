'use client'

import Link from 'next/link'
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapControls,
} from '@/components/ui/map'

interface ExperienceWhereWeMeetProps {
  meetingPoint?: string
  address: string
  city: string
  country?: string
  latitude: number
  longitude: number
}

export default function ExperienceWhereWeMeet({
  meetingPoint,
  address,
  city,
  country = '',
  latitude,
  longitude,
}: ExperienceWhereWeMeetProps) {
  const locationPart = [address, city, country].filter(Boolean).join(', ')
  const displayText = meetingPoint?.trim()
    ? `${meetingPoint} | ${locationPart || city}`
    : locationPart || city

  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`

  return (
    <section id="map-section" className="w-full">
      <h2 className="text-[22px] font-semibold text-[#222222] mb-4">
        Dónde nos encontraremos
      </h2>
      <p className="text-base text-[#222222] mb-4 leading-relaxed">
        {displayText}
      </p>
      <div className="w-full rounded-xl overflow-hidden border border-[#EBEBEB] bg-neutral-100 shadow-sm">
        <div className="relative aspect-[4/3] min-h-[280px] w-full">
          <Map
            center={[longitude, latitude]}
            zoom={15}
            className="rounded-xl"
          >
            <MapMarker longitude={longitude} latitude={latitude}>
              <MarkerContent>
                <MarkerLabel position="bottom">Punto de encuentro</MarkerLabel>
              </MarkerContent>
            </MapMarker>
            <MapControls
              position="top-right"
              showZoom
              showFullscreen
            />
          </Map>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border-t border-[#EBEBEB]">
          <span className="text-sm font-medium text-[#222222]">Punto de encuentro</span>
          <Link
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#222222] underline hover:no-underline"
          >
            Ver en Google Maps
          </Link>
        </div>
      </div>
    </section>
  )
}
