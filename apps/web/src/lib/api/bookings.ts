import { apiClient } from './client'
import { Booking } from '@/types'

export interface CreateBookingResponse {
  booking: Booking
  clientSecret: string
  paymentIntentId: string
}

export const bookingsApi = {
  create: async (data: {
    propertyId: string
    checkIn: string
    checkOut: string
    guests: number
  }) => {
    const response = await apiClient.post<CreateBookingResponse>('/bookings', data)
    return response.data
  },

  getMyBookings: async () => {
    const response = await apiClient.get<Booking[]>('/bookings/my-bookings')
    return response.data
  },

  getHostBookings: async () => {
    const response = await apiClient.get<Booking[]>('/bookings/host-bookings')
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`)
    return response.data
  },

  confirm: async (id: string) => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/confirm`)
    return response.data
  },

  cancel: async (id: string) => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`)
    return response.data
  },
}