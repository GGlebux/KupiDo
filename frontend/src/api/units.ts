import { api } from './client'
import type { Unit, PaginatedResponse } from '../types'

export const unitsApi = {
  listByProject: (projectId: string, params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Unit>>(`/projects/${projectId}/units`, { params }).then(r => r.data),

  get: (id: string) => api.get<Unit>(`/units/${id}`).then(r => r.data),

  create: (data: Partial<Unit>) => api.post<Unit>('/units', data).then(r => r.data),

  update: (id: string, data: Partial<Unit>) => api.patch<Unit>(`/units/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/units/${id}`),
}
