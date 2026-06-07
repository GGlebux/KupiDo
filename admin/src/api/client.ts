import axios from 'axios'

export const api = axios.create({ baseURL: '/api/v1' })

// Единый токен с сайтом: тот же origin -> тот же localStorage.
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      // На общую форму входа сайта (другой origin-путь -> полная навигация).
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
