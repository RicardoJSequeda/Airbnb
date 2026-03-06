'use client'

import L from 'leaflet'
import { useCallback, useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT_CENTER: [number, number] = [4.6097, -74.0817]

interface HostLocationMapProps {
  latitude: number | null
  longitude: number | null
  onLocationSelect: (lat: number, lng: number) => void
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onSelect(lat, lng)
    },
  })
  return null
}

function MapCenterUpdater({
  center,
  zoom,
}: {
  center: [number, number]
  zoom: number
}) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center[0], center[1], zoom])
  return null
}

export function HostLocationMap({
  latitude,
  longitude,
  onLocationSelect,
}: HostLocationMapProps) {
  const hasPosition = latitude != null && longitude != null
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : DEFAULT_CENTER
  const zoom = hasPosition ? 15 : 10

  return (
    <div className="w-full h-full min-h-0 rounded-xl overflow-hidden border border-gray-200 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl [&_.leaflet-pane]:z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {hasPosition && (
          <Marker position={[latitude, longitude]} icon={icon} />
        )}
        <MapClickHandler onSelect={onLocationSelect} />
        <MapCenterUpdater center={center} zoom={zoom} />
      </MapContainer>
    </div>
  )
}
