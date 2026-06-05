import { api } from './client'
import type { Review, PaginatedResponse } from '../types'

export const reviewsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Review>>('/reviews', { params }).then(r => r.data),

  create: (data: { rating: number; text: string; project_id?: string }) =>
    api.post<Review>('/reviews', data).then(r => r.data),

  delete: (id: string) => api.delete(`/reviews/${id}`),
}
