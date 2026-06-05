import { api } from './client'
import type { Favorite } from '../types'

export const favoritesApi = {
  list: () => api.get<Favorite[]>('/favorites').then(r => r.data),

  add: (data: { project_id?: string; unit_id?: string }) =>
    api.post<Favorite>('/favorites', data).then(r => r.data),

  removeByTarget: (data: { project_id?: string; unit_id?: string }) =>
    api.delete('/favorites', { params: data }),
}
