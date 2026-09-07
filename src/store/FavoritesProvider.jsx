import { createContext, useContext, useEffect, useRef } from 'react'
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
 * Provides favorites state to the component tree.
 *
 * Guests are first-class here: their favorites live in localStorage and the
 * heart works with no account (see hooks/useFavorites.js). Signing in is
 * additive — it syncs the same list to Supabase so it follows the user across
 * devices, and the guest's existing favorites are carried over rather than
 * discarded.
 */
export function FavoritesProvider({ children }) {
  const { user, loading: authLoading } = useAuth()

  // Hold off until auth state is known to avoid a flash of empty state
  const userId = authLoading ? undefined : user?.id ?? null
  const { ids, isFav, toggle, loading, reload } = useFavoritesData(userId)

  // Guard against re-running the merge for a user already handled this session.
  const mergedFor = useRef(null)

  // Carry guest favorites into the account on sign-in.
  //
  // reload() afterwards is load-bearing: the merge upsert and the initial
  // Supabase read fire off at roughly the same moment, so without an explicit
  // refresh the just-merged rows would be missing from the list until the next
  // page load — the user would watch their guest favorites vanish.
  useEffect(() => {
    if (!user?.id) {
      mergedFor.current = null
      return
    }
    if (mergedFor.current === user.id) return
    mergedFor.current = user.id

    let cancelled = false
    migrateFavorites(user.id).then(() => {
      if (!cancelled) reload()
    })
    return () => { cancelled = true }
  }, [user?.id, reload])

  return (
    <FavoritesContext.Provider value={{ ids, isFav, toggle, loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}
