import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Favorite } from '../types'
import { favoritesApi } from '../api/favorites'
import { useAuth } from './authContext'
import { useToast } from './toast'

interface FavoritesApi {
  favorites: Favorite[]
  loading: boolean
  isProjectFav: (id: string) => boolean
  isUnitFav: (id: string) => boolean
  toggleProject: (id: string) => Promise<void>
  toggleUnit: (id: string) => Promise<void>
  reload: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesApi>(null!)
export const useFavorites = () => useContext(FavoritesContext)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { notify } = useToast()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!user) { setFavorites([]); return }
    setLoading(true)
    try {
      setFavorites(await favoritesApi.list())
    } catch {
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { reload() }, [reload])

  const isProjectFav = (id: string) => favorites.some(f => f.project_id === id)
  const isUnitFav = (id: string) => favorites.some(f => f.unit_id === id)

  const toggle = async (key: 'project_id' | 'unit_id', id: string) => {
    if (!user) {
      notify('Войдите, чтобы добавлять в избранное', 'info')
      return
    }
    const already = favorites.some(f => f[key] === id)
    try {
      if (already) {
        await favoritesApi.removeByTarget({ [key]: id })
        setFavorites(prev => prev.filter(f => f[key] !== id))
        notify('Удалено из избранного', 'info')
      } else {
        const fav = await favoritesApi.add({ [key]: id })
        setFavorites(prev => [fav, ...prev])
        notify('Добавлено в избранное', 'success')
      }
    } catch {
      notify('Не удалось обновить избранное', 'error')
    }
  }

  const toggleProject = (id: string) => toggle('project_id', id)
  const toggleUnit = (id: string) => toggle('unit_id', id)

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isProjectFav, isUnitFav, toggleProject, toggleUnit, reload }}>
      {children}
    </FavoritesContext.Provider>
  )
}
