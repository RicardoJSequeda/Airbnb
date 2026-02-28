'use client'

import { useState, useEffect, useCallback } from 'react'
import { SUGGESTED_DESTINATIONS } from '@/lib/constants/destinations'
import type { LocationSuggestion } from '@/lib/api/locations'
import type { SearchVariantStrategy } from '@/config/search'

function mapDestinationToSuggestion(d: {
  name: string
  city: string
  region: string
  description?: string
}): LocationSuggestion {
  return {
    id: d.city,
    name: d.name,
    city: d.city,
    region: d.region,
    description: d.description ?? null,
    latitude: null,
    longitude: null,
  }
}

const fallbackSuggestions: LocationSuggestion[] = SUGGESTED_DESTINATIONS.map(mapDestinationToSuggestion)

export interface UseSearchSuggestionsResult {
  suggestions: LocationSuggestion[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Sugerencias delegadas a la estrategia. Sin dependencia de variante.
 */
export function useSearchSuggestions(
  strategy: SearchVariantStrategy,
  query?: string
): UseSearchSuggestionsResult {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(() => {
    setLoading(true)
    setError(null)
    strategy
      .fetchSuggestions(query)
      .then(setSuggestions)
      .catch(() => {
        setError('Error al cargar sugerencias')
        setSuggestions(fallbackSuggestions)
      })
      .finally(() => setLoading(false))
  }, [strategy, query])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  return { suggestions, loading, error, refetch: fetchSuggestions }
}
