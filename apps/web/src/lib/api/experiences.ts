import { apiClient } from './client'
import { Experience } from '@/types/experience'

/** API pública del marketplace (sin auth) */
export const publicExperiencesApi = {
  getAll: async (params?: {
    city?: string
    country?: string
    category?: string
    minParticipants?: number
  }) => {
    const response = await apiClient.get<Experience[]>('/public/experiences', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Experience>(`/public/experiences/${id}`)
    return response.data
  },
}

/** API privada del dashboard (requiere auth + org) */
export const experiencesApi = {
  ...publicExperiencesApi,

  getAll: async (params?: {
    city?: string
    country?: string
    category?: string
  }) => {
    const response = await apiClient.get<Experience[]>('/dashboard/experiences', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Experience>(`/dashboard/experiences/${id}`)
    return response.data
  },

  create: async (data: Partial<Experience>) => {
    const response = await apiClient.post<Experience>('/dashboard/experiences', data)
    return response.data
  },

  update: async (id: string, data: Partial<Experience>) => {
    const response = await apiClient.patch<Experience>(`/dashboard/experiences/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/dashboard/experiences/${id}`)
  },

  publish: async (id: string) => {
    const response = await apiClient.patch<Experience>(`/dashboard/experiences/${id}/publish`)
    return response.data
  },

  getMyExperiences: async () => {
    const response = await apiClient.get<Experience[]>('/dashboard/experiences')
    return response.data
  },
}
