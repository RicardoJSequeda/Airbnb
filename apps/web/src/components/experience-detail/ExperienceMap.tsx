'use client'

import dynamic from 'next/dynamic'

const ExperienceMapDynamic = dynamic(
  () => import('./ExperienceMapInner').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[4/3] min-h-[280px] w-full items-center justify-center rounded-xl bg-neutral-100">
        <span className="text-sm text-neutral-500">Cargando mapa...</span>
      </div>
    ),
  }
)

interface ExperienceMapProps {
  latitude: number
  longitude: number
}

export default function ExperienceMap({ latitude, longitude }: ExperienceMapProps) {
  return (
    <ExperienceMapDynamic latitude={latitude} longitude={longitude} />
  )
}
