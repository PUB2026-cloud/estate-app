import { useState, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('estate_favorites') || '[]')
    } catch { return [] }
  })

  const toggle = useCallback((property) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === property.id)
      const next = exists ? prev.filter(f => f.id !== property.id) : [...prev, property]
      localStorage.setItem('estate_favorites', JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((id) => favorites.some(f => f.id === id), [favorites])

  return { favorites, toggle, isFav }
}
