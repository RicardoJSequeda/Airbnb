import { apiClient } from './client'
import { Property } from '@/types'

/** API pública del marketplace (sin auth) */
export const publicPropertiesApi = {
  getAll: async (params?: {
    city?: string
    country?: string
    propertyType?: string
  }) => {
    const response = await apiClient.get<Property[]>('/public/properties', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Property>(`/public/properties/${id}`)
    return response.data
  },
}

/** API privada del dashboard (requiere auth + org) */
export const propertiesApi = {
  ...publicPropertiesApi,

  getAll: async (params?: {
    city?: string
    country?: string
    propertyType?: string
  }) => {
    const response = await apiClient.get<Property[]>('/dashboard/properties', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Property>(`/dashboard/properties/${id}`)
    return response.data
  },

  create: async (data: Partial<Property>) => {
    const response = await apiClient.post<Property>('/dashboard/properties', data)
    return response.data
  },

  update: async (id: string, data: Partial<Property>) => {
    const response = await apiClient.patch<Property>(`/dashboard/properties/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/dashboard/properties/${id}`)
  },

  publish: async (id: string) => {
    const response = await apiClient.patch<Property>(`/dashboard/properties/${id}/publish`)
    return response.data
  },

  getMyProperties: async () => {
    const response = await apiClient.get<Property[]>('/dashboard/properties')
    return response.data
  },
}