import { api } from './client'
import type { Project, PaginatedResponse } from '../types'

export const projectsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Project>>('/projects', { params }).then(r => r.data),

  get: (slug: string) => api.get<Project>(`/projects/${slug}`).then(r => r.data),

  create: (data: Partial<Project>) => api.post<Project>('/projects', data).then(r => r.data),

  update: (id: string, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/projects/${id}`),
}
