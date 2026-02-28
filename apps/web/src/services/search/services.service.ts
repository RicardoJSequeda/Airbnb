import { locationsApi, type LocationSuggestion } from '@/lib/api/locations'
import { SUGGESTED_DESTINATIONS } from '@/lib/constants/destinations'

function toSuggestion(d: { name: string; city: string; region: string; description?: string }): LocationSuggestion {
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

const fallback = SUGGESTED_DESTINATIONS.map(toSuggestion)

/** Por ahora destinos; luego puede ser /api/search/services/suggestions. */
export async function fetchServiceSuggestions(_query?: string): Promise<LocationSuggestion[]> {
  return locationsApi.getSuggestions({ sortBy: 'displayOrder' }).catch(() => fallback)
}
