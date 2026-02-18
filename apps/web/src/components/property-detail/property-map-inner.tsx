'use client'

import L from 'leaflet'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

// Corregir iconos del marker (webpack rompe las rutas por defecto de Leaflet)
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface PropertyMapInnerProps {
  latitude: number
  longitude: number
  address?: string
  title?: string
}

export default function PropertyMapInner({
  latitude,
  longitude,
}: PropertyMapInnerProps) {
  return (
    <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ minHeight: 300 }}
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
