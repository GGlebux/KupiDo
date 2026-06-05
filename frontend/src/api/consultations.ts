import { api } from './client'
import type { ConsultationRequest } from '../types'

export const consultationsApi = {
  create: (data: { name: string; phone: string; email?: string; project_id?: string; message?: string }) =>
    api.post<ConsultationRequest>('/consultations', data).then(r => r.data),
}
