/**
 * Geocoding con Nominatim (OpenStreetMap). Gratuito, sin API key.
 * Ver: https://nominatim.org/release-docs/develop/api/Search/
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'AirbnbCloneHost/1.0 (contact@example.com)'

export interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

export async function searchAddress(
  query: string,
  limit = 5
): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 3) return []
  const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query.trim())}&format=json&limit=${limit}`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'es', 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return []
  const data = (await res.json()) as NominatimResult[]
  return data
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'es', 'User-Agent': USER_AGENT },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { display_name?: string }
  return data.display_name ?? null
}
