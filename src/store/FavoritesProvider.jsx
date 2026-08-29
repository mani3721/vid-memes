import { createContext, useContext, useEffect } from 'react'
import { useAuth } from '../lib/authContext'
import { useFavorites as useFavoritesData } from '../hooks/useFavorites'
import { migrateFavorites } from '../lib/migrateFavorites'

const FavoritesContext = createContext(null)

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return ctx
}

/**
 * Provides Supabase-backed favorites state to the component tree.
 *
 * On mount (or when the user signs in): migrates any legacy localStorage
 * favorites to Supabase, then loads the user's saved meme IDs.
 *
 * Guests get an empty set; toggle() returns 'unauthenticated' so callers
 * can show a sign-in prompt instead of silently failing.
 */
export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth()

  // Hold off until auth state is known to avoid a flash of empty state
  const userId = authLoading ? undefined : user?.id ?? null
  const { ids, isFav, toggle, loading } = useFavoritesData(userId)

  // One-time migration: lift any legacy localStorage favorites into Supabase
  useEffect(() => {
    if (user?.id) migrateFavorites(user.id)
  }, [user?.id])

  return (
    <FavoritesContext.Provider value={{ ids, isFav, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}
