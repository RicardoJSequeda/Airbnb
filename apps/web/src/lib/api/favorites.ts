import { apiClient } from './client'
import { Favorite } from '@/types'

export const favoritesApi = {
  getAll: async () => {
    const response = await apiClient.get<Favorite[]>('/favorites')
    return response.data
  },

  add: async (propertyId: string) => {
    const response = await apiClient.post<Favorite>(`/favorites/${propertyId}`)
    return response.data
  },

  remove: async (propertyId: string) => {
    await apiClient.delete(`/favorites/${propertyId}`)
  },

  toggle: async (propertyId: string) => {
    const response = await apiClient.post<{ isFavorite: boolean; message: string }>(
      `/favorites/toggle/${propertyId}`
    )
    return response.data
  },

  check: async (propertyId: string) => {
    const response = await apiClient.get<{ isFavorite: boolean; favoriteId: string | null }>(
      `/favorites/check/${propertyId}`
    )
    return response.data
  },
}