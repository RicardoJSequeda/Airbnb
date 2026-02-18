'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Property } from '@/types'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 12)
  }, [map, lat, lng])
  return null
}

interface SearchMapProps {
  properties: Property[]
  center: { lat: number; lng: number }
}

export default function SearchMap({ properties, center }: SearchMapProps) {
  const valid = properties.filter((p) => p.latitude && p.longitude)
  if (valid.length === 0) return null

  return (
    <div className="h-full w-full rounded-xl overflow-hidden [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <MapCenter lat={center.lat} lng={center.lng} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {valid.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.title}</p>
                <p className="text-gray-600">
                  {(p.price ?? 0).toLocaleString()} € / noche
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
