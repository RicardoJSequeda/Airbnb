'use client'

/** Controlled: value (destination) y callbacks vienen del padre; solo presenta lista y dispara onSelect/onNearby/onNeighborhoodSelect. */
import { MapPin, Home, Binoculars } from 'lucide-react'
import type { LocationSuggestion } from '@/lib/api/locations'
import type { CityPlacesResponse } from '@/lib/api/locations'

export interface LocationInputValue {
  id?: string
  name: string
  city: string
  region: string
  isNearby?: boolean
  latitude?: number
  longitude?: number
}

interface LocationInputProps {
  placeholder: string
  value: LocationInputValue | null
  onSelect: (suggestion: LocationSuggestion) => void
  onNearby: () => void
  onNeighborhoodSelect: (name: string) => void
  suggestions: LocationSuggestion[]
  loading: boolean
  geoError: string | null
  showNeighborhoods: boolean
  placesData: CityPlacesResponse | null
  onClear?: () => void
}

export function LocationInput({
  placeholder,
  value,
  onSelect,
  onNearby,
  onNeighborhoodSelect,
  suggestions,
  loading,
  geoError,
  showNeighborhoods,
  placesData,
  onClear,
}: LocationInputProps) {
  return (
    <div className="p-4 overflow-y-auto max-h-[480px]">
      <h3 className="text-xs font-semibold text-secondary mb-3">Destinos sugeridos</h3>
      <button
        type="button"
        className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
        onClick={onNearby}
      >
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-secondary">Cerca</div>
          <div className="text-sm text-gray-500">Descubre qué hay a tu alrededor</div>
        </div>
      </button>
      {geoError && (
        <p className="mt-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg">{geoError}</p>
      )}
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Cargando...</p>
      ) : !showNeighborhoods ? (
        suggestions.map((d) => (
          <button
            key={d.id}
            type="button"
            className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
            onClick={() => onSelect(d)}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-secondary">{d.name}</div>
              <div className="text-sm text-gray-500">{d.description ?? ''}</div>
            </div>
          </button>
        ))
      ) : (
        placesData?.places.map((n) => (
          <button
            key={n.id}
            type="button"
            className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
            onClick={() => onNeighborhoodSelect(n.name)}
          >
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
              {n.type === 'STADIUM' ? (
                <Binoculars className="w-5 h-5 text-gray-600" />
              ) : (
                <Home className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-secondary">{n.name}</div>
              <div className="text-sm text-gray-500">
                {n.description ??
                  (n.type === 'STADIUM'
                    ? 'Estadio'
                    : n.type === 'LANDMARK'
                      ? 'Lugar emblemático'
                      : 'Vecindario')}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  )
}
