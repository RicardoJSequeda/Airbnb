import { apiClient } from './client'

export interface LocationSuggestion {
  id: string
  name: string
  city: string
  region: string
  description: string | null
  latitude: number | null
  longitude: number | null
}

export interface PlaceSuggestion {
  id: string
  name: string
  type: string
  description: string | null
}

export interface CityPlacesResponse {
  city: {
    id: string
    name: string
    fullName: string
    region: string
  }
  places: PlaceSuggestion[]
}

export const locationsApi = {
  getSuggestions: async (params?: {
    department?: string
    limit?: number
    sortBy?: 'displayOrder' | 'trending'
  }) => {
    const { data } = await apiClient.get<LocationSuggestion[]>('/public/locations/suggestions', {
      params,
    })
    return data
  },

  getPlacesByCity: async (citySlug: string) => {
    const { data } = await apiClient.get<CityPlacesResponse>(
      `/public/locations/cities/${citySlug}/places`
    )
    return data
  },

  getDepartments: async () => {
    const { data } = await apiClient.get<{ id: string; name: string; slug: string; country: string }[]>(
      '/public/locations/departments'
    )
    return data
  },

  searchCities: async (query: string, limit = 10) => {
    if (!query || query.trim().length < 2) return []
    const { data } = await apiClient.get<{ id: string; name: string; city: string; region: string }[]>(
      '/public/locations/search',
      { params: { q: query, limit } }
    )
    return data
  },

  logSearch: async (cityId: string) => {
    await apiClient.post('/public/locations/search-log', { cityId })
  },
}
