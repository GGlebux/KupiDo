export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  type?: 'multi_apartment' | 'private_house_group'
  deal_type?: 'sale' | 'rent'
  description?: string
  location?: string
  address?: string
  status: 'active' | 'sold_out' | 'upcoming'
  price_from?: number
  deadline?: string
  photos?: Photo[]
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  project_id: string
  title?: string
  type: 'apartment' | 'house' | 'studio' | 'penthouse'
  area: number
  floor?: number
  rooms?: number
  price?: number
  status: 'available' | 'booked' | 'sold'
  description?: string
  photos?: Photo[]
  created_at: string
}

export interface Photo {
  id: string
  project_id: string
  unit_id?: string
  url: string
  caption?: string
  order: number
  is_cover: boolean
  created_at: string
}

export interface Booking {
  id: string
  unit_id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'cancelled'
  payment_status?: 'not_paid' | 'deposit_paid' | 'fully_paid'
  payment_amount?: number
  comment?: string
  unit?: Unit
  created_at: string
  updated_at: string
}

export interface ConsultationRequest {
  id: string
  name: string
  phone: string
  email?: string
  project_id?: string
  user_id?: string
  message?: string
  result?: string
  is_processed: boolean
  created_at: string
}

export interface Review {
  id: string
  rating: number
  text: string
  is_published: boolean
  project_id?: string
  user_id: string
  user?: { id: string; first_name?: string; last_name?: string }
  project?: { id: string; title: string; slug: string }
  created_at: string
}

export interface Favorite {
  id: string
  project_id?: string
  unit_id?: string
  project?: Project
  unit?: Unit
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { page: number; size: number; total: number }
}
