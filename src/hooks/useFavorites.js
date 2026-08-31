import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

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
  } catch {}
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

  useEffect(() => {
    // Still waiting for auth to resolve
    if (userId === undefined) return

    if (!userId) {
      // Guest: load from localStorage
      setIds(new Set(readLocalIds()))
      setLoading(false)
      return
    }

    // Authenticated: load from Supabase
    setLoading(true)
    supabase
      .from('favorites')
      .select('meme_id')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (!error && data) setIds(new Set(data.map((f) => f.meme_id)))
        setLoading(false)
      })
  }, [userId])

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

      // Authenticated: sync to Supabase
      const { error } = wasFav
        ? await supabase.from('favorites').delete().eq('user_id', userId).eq('meme_id', memeId)
        : await supabase.from('favorites').insert({ user_id: userId, meme_id: memeId })

      if (error) {
        setIds((prev) => {
          const next = new Set(prev)
          wasFav ? next.add(memeId) : next.delete(memeId)
          return next
        })
      }
    },
    [userId, ids],
  )

  return { ids: [...ids], isFav, toggle, loading }
}
