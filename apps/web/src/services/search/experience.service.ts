import { fetchAccommodationSuggestions } from './accommodation.service'
import type { LocationSuggestion } from '@/lib/api/locations'

/** Por ahora mismo origen que accommodation; luego puede ser API de intereses/ciudades. */
export async function fetchExperienceSuggestions(query?: string): Promise<LocationSuggestion[]> {
  return fetchAccommodationSuggestions(query)
}
