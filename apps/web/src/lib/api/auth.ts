import { apiClient } from './client'
import { AuthResponse, User } from '@/types'

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },
}