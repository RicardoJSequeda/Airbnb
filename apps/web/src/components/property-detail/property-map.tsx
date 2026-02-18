'use client'

import dynamic from 'next/dynamic'

interface PropertyMapProps {
  latitude: number
  longitude: number
  address?: string
  title?: string
}

const PropertyMapInner = dynamic(
  () =>
    import('./property-map-inner').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 animate-pulse">Cargando mapa...</span>
      </div>
    ),
  }
)

export default function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapInner {...props} />
}
