import { useState, useEffect, createContext, useContext } from 'react'
import { authApi } from '../api'

// Единая форма входа находится на сайте (тот же origin, путь /login).
const SITE_LOGIN = '/login'
const SITE_HOME = '/'

interface AuthState {
  user: Record<string, unknown> | null
  loading: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthState>({} as AuthState)
export const useAdminAuth = () => useContext(AuthContext)

export function useAuthState(): AuthState {
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    // Нет токена — отправляем на общую форму входа сайта.
    if (!token) { window.location.href = SITE_LOGIN; return }

    authApi.me()
      .then(me => {
        // В админку пускаем только администраторов; остальных — на вход сайта.
        if (me.role !== 'admin') { window.location.href = SITE_LOGIN; return }
        setUser(me)
        setLoading(false)
      })
      .catch(() => { window.location.href = SITE_LOGIN })
  }, [])

  // Выход общий с сайтом: чистим токен и возвращаемся на главную сайта.
  const logout = () => {
    localStorage.removeItem('access_token')
    window.location.href = SITE_HOME
  }

  return { user, loading, logout }
}
