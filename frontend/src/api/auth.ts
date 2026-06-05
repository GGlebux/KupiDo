import { api } from './client'
import type { User } from '../types'

export const authApi = {
  register: (data: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) =>
    api.post<User>('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>('/auth/login', { email, password }).then(r => r.data),

  me: () => api.get<User>('/auth/me').then(r => r.data),

  updateMe: (data: Partial<User> & { password?: string }) =>
    api.patch<User>('/auth/me', data).then(r => r.data),
}
