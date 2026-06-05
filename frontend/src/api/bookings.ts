import { api } from './client'
import type { Booking, PaginatedResponse } from '../types'

export const bookingsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }).then(r => r.data),

  create: (unit_id: string, comment?: string) =>
    api.post<Booking>('/bookings', { unit_id, comment }).then(r => r.data),

  cancel: (id: string) => api.delete(`/bookings/${id}`),
}
