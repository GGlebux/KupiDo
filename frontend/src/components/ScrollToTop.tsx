import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * При переходе на другой маршрут прокручивает страницу в начало.
 * Раньше переходы по ссылкам из подвала/шапки открывали страницу
 * на том же месте прокрутки, где была предыдущая.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}
