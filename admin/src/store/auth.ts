import { useState, useEffect, createContext, useContext } from 'react'
import { authApi } from '../api'

interface AuthState {
  user: Record<string, unknown> | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState>({} as AuthState)
export const useAdminAuth = () => useContext(AuthContext)

export function useAuthState(): AuthState {
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password)
    localStorage.setItem('admin_token', access_token)
    const me = await authApi.me()
    if (me.role !== 'admin') {
      localStorage.removeItem('admin_token')
      throw new Error('Недостаточно прав')
    }
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return { user, loading, login, logout }
}
