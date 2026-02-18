import { apiClient } from './client'
import type { Review } from '@/types'

export interface CreateReviewInput {
  bookingId: string
  rating: number
  comment?: string
}

export interface ReviewsByPropertyResponse {
  reviews: Review[]
  summary: {
    totalReviews: number
    averageRating: number
    ratingBreakdown: Record<number, number>
  }
}

export const reviewsApi = {
  create: async (data: CreateReviewInput) => {
    const response = await apiClient.post<Review>('/reviews', data)
    return response.data
  },

  getByProperty: async (propertyId: string) => {
    const response = await apiClient.get<ReviewsByPropertyResponse>(
      `/reviews/property/${propertyId}`,
    )
    return response.data
  },

  getMyReviews: async () => {
    const response = await apiClient.get<Review[]>('/reviews/my-reviews')
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Review>(`/reviews/${id}`)
    return response.data
  },

  update: async (id: string, data: { rating?: number; comment?: string }) => {
    const response = await apiClient.patch<Review>(`/reviews/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/reviews/${id}`)
  },
}
