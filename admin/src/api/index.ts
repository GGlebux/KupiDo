import { api } from './client'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
}

export const projectsApi = {
  list: (p?: object) => api.get('/projects', { params: p }).then(r => r.data),
  get: (slug: string) => api.get(`/projects/${slug}`).then(r => r.data),
  create: (d: object) => api.post('/projects', d).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/projects/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

export const unitsApi = {
  list: (p?: object) => api.get('/units', { params: p }).then(r => r.data),
  listByProject: (id: string) => api.get(`/projects/${id}/units`).then(r => r.data),
  get: (id: string) => api.get(`/units/${id}`).then(r => r.data),
  create: (d: object) => api.post('/units', d).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/units/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/units/${id}`),
}

export const bookingsApi = {
  list: (p?: object) => api.get('/bookings', { params: p }).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/bookings/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/bookings/${id}`),
}

export const consultationsApi = {
  list: (p?: object) => api.get('/consultations', { params: p }).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/consultations/${id}`, d).then(r => r.data),
}

export const usersApi = {
  list: (p?: object) => api.get('/users', { params: p }).then(r => r.data),
  get: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/users/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export const reviewsApi = {
  list: (p?: object) => api.get('/reviews', { params: { all: true, ...p } }).then(r => r.data),
  update: (id: string, d: object) => api.patch(`/reviews/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

export const photosApi = {
  listByProject: (id: string) => api.get(`/projects/${id}/photos`).then(r => r.data.data as Record<string, unknown>[]),
  listByUnit: (id: string) => api.get(`/units/${id}/photos`).then(r => r.data.data as Record<string, unknown>[]),
  // Content-Type не задаём вручную: браузер сам проставит multipart/form-data с boundary.
  upload: (formData: FormData) => api.post('/photos', formData).then(r => r.data),
  fromUrl: (d: object) => api.post('/photos/from-url', d).then(r => r.data),
  updateOrder: (id: string, order: number) => api.patch(`/photos/${id}/order`, { order }).then(r => r.data),
  delete: (id: string) => api.delete(`/photos/${id}`),
}
