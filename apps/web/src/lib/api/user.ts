import { apiClient } from './client'
import { User } from '@/types'

export const userApi = {
  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.patch<User>('/auth/profile', data)
    return response.data
  },
}
