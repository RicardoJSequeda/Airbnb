import { apiClient } from './client'

export const paymentsApi = {
  createIntent: async (bookingId: string) => {
    const response = await apiClient.post<{
      clientSecret: string
      paymentIntentId: string
      amount: number
      payment: { id: string; status: string }
    }>('/payments/create-intent', { bookingId })
    return response.data
  },

  confirm: async (paymentIntentId: string, bookingId: string) => {
    const response = await apiClient.post<{
      id: string
      status: string
      paymentBreakdown?: { totalAmount: number; platformFee: number; hostNetAmount: number }
    }>('/payments/confirm', { paymentIntentId, bookingId })
    return response.data
  },

  getByBooking: async (bookingId: string) => {
    const response = await apiClient.get(`/payments/booking/${bookingId}`)
    return response.data
  },
}
