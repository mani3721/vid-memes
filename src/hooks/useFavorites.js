import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/appwriteClient'

const LOCAL_KEY = 'videsaur_fav_ids'

function readLocalIds() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalIds(ids) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...ids]))
  } catch {
    // Ignore quota/private-mode write failures — favorites are best-effort locally.
  }
}

/**
 * Supabase-backed favorites for authenticated users;
 * localStorage-backed for guests. Works without sign-in.
 * Used internally by FavoritesProvider.
 *
 * @param {string|null|undefined} userId — undefined while auth is loading
 */
export function useFavorites(userId) {
  const [ids, setIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Bumping this re-runs the load. FavoritesProvider bumps it once the
  // guest → account merge has finished, so the merged rows appear immediately
  // rather than on the next page load.
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = useCallback(() => setRefreshKey((n) => n + 1), [])

  useEffect(() => {
    // Still waiting for auth to resolve
    if (userId === undefined) return

    let cancelled = false

    if (!userId) {
      // Guest: load from localStorage
      setIds(new Set(readLocalIds()))
      setLoading(false)
      return
    }

    // Authenticated: load from the API (Appwrite)
    setLoading(true)
    apiFetch('/api/favorites')
      .then(({ ids: list }) => {
        if (!cancelled) setIds(new Set(list ?? []))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId, refreshKey])

  const isFav = useCallback((id) => ids.has(id), [ids])

  const toggle = useCallback(
    async (memeId) => {
      const wasFav = ids.has(memeId)

      // Optimistic UI update
      setIds((prev) => {
        const next = new Set(prev)
        wasFav ? next.delete(memeId) : next.add(memeId)
        if (!userId) writeLocalIds(next)
        return next
      })

      if (!userId) return // guest: localStorage already updated above

      // Authenticated: sync to the API
      const ok = await (wasFav
        ? apiFetch(`/api/favorites/${encodeURIComponent(memeId)}`, { method: 'DELETE' })
        : apiFetch('/api/favorites', { method: 'POST', body: { memeId } })
      ).then(() => true, () => false)

      if (!ok) {
        setIds((prev) => {
          const next = new Set(prev)
          wasFav ? next.add(memeId) : next.delete(memeId)
          return next
        })
      }
    },
    [userId, ids],
  )

  return { ids: [...ids], isFav, toggle, loading, reload }
}
