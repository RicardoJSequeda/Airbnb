'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { searchAddress, reverseGeocode } from '@/lib/geocoding/nominatim'
import type { NominatimResult } from '@/lib/geocoding/nominatim'

const HostLocationMap = dynamic(
  () =>
    import('./HostLocationMap').then((mod) => mod.HostLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] sm:h-[500px] rounded-xl border border-[#DDDDDD] bg-gray-100 flex items-center justify-center">
        <span className="text-sm text-gray-500 animate-pulse">Cargando mapa...</span>
      </div>
    ),
  }
)

const DEBOUNCE_MS = 400

interface LocationStepProps {
  address: string
  onAddressChange: (value: string) => void
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number) => void
}

export function LocationStep({
  address,
  onAddressChange,
  latitude,
  longitude,
  onLocationChange,
}: LocationStepProps) {
  const [query, setQuery] = useState(address)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [reversing, setReversing] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(address)
  }, [address])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      setSearching(true)
      searchAddress(query.trim(), 5)
        .then(setSuggestions)
        .then(() => setOpen(true))
        .finally(() => {
          setSearching(false)
          debounceRef.current = null
        })
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = useCallback(
    (result: NominatimResult) => {
      onAddressChange(result.display_name)
      onLocationChange(Number(result.lat), Number(result.lon))
      setQuery(result.display_name)
      setSuggestions([])
      setOpen(false)
    },
    [onAddressChange, onLocationChange]
  )

  const handleMapSelect = useCallback(
    async (lat: number, lng: number) => {
      onLocationChange(lat, lng)
      setReversing(true)
      try {
        const name = await reverseGeocode(lat, lng)
        if (name) {
          onAddressChange(name)
          setQuery(name)
        }
      } finally {
        setReversing(false)
      }
    },
    [onLocationChange, onAddressChange]
  )

  return (
    <section className="max-w-[800px] mx-auto px-3 sm:px-4 py-3">
      <h2 className="text-lg sm:text-xl font-semibold text-[#222222] mb-2 max-w-[560px]">
        ¿Dónde se encuentra tu espacio?
      </h2>
      <p className="text-sm text-[#222222] mb-4 max-w-[560px]">
        Solo compartiremos tu dirección con los huéspedes que hayan hecho una reservación.
      </p>

      <div className="relative z-10 mb-4" ref={containerRef}>
        <MapPin
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#222222] pointer-events-none z-10"
          strokeWidth={1.8}
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 3 && suggestions.length > 0 && setOpen(true)}
          placeholder="Busca o escribe una dirección (mín. 3 caracteres)"
          className="w-full pl-10 pr-4 py-3 text-base border border-[#DDDDDD] rounded-xl bg-white shadow-sm placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent"
          aria-label="Dirección del alojamiento"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            Buscando...
          </span>
        )}
        {open && suggestions.length > 0 && (
          <ul
            className="absolute left-0 right-0 top-full mt-1 py-1 bg-white border border-[#DDDDDD] rounded-xl shadow-lg z-[1000] max-h-60 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s.place_id} role="option">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-[#222222] transition"
                  onClick={() => handleSelectSuggestion(s)}
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reversing && (
        <p className="text-sm text-gray-500 mb-2">Obteniendo dirección del punto...</p>
      )}

      <div className="relative z-0 w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden border border-[#DDDDDD]">
        <HostLocationMap
          latitude={latitude}
          longitude={longitude}
          onLocationSelect={handleMapSelect}
        />
      </div>
      <p className="text-xs text-[#717171] mt-2">
        Haz clic en el mapa para marcar la ubicación exacta.
      </p>
    </section>
  )
}
