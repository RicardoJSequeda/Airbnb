'use client'

import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface ExperienceMapInnerProps {
  latitude: number
  longitude: number
}

export default function ExperienceMapInner({ latitude, longitude }: ExperienceMapInnerProps) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: 280 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[latitude, longitude]} icon={icon} />
      </MapContainer>
    </div>
  )
}
