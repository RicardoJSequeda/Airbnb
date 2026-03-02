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

/** Destinos para servicios: soporta búsqueda por texto y fallback a sugerencias. */
export async function fetchServiceSuggestions(query?: string): Promise<LocationSuggestion[]> {
  // Si el usuario escribe al menos 2 caracteres, buscamos ciudades/lugares concretos
  if (query && query.trim().length >= 2) {
    const cities = await locationsApi.searchCities(query, 10)
    return cities.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      region: c.region,
      description: null,
      latitude: null,
      longitude: null,
    }))
  }

  // Si no hay query, devolvemos sugerencias destacadas (por popularidad/orden)
  return locationsApi.getSuggestions({ sortBy: 'displayOrder' }).catch(() => fallback)
}
