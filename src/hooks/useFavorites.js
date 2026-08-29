import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Raw Supabase-backed favorites hook.
 * Accepts a userId; returns null-safe state for guests.
 * Used internally by FavoritesProvider — call useFavorites() from context instead.
 *
 * @param {string|null|undefined} userId — Supabase auth.users.id
 */
export function useFavorites(userId) {
  const [ids, setIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIds(new Set())
      setLoading(false)
      return
    }

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

  /**
   * Toggle a meme's favorite state.
   * Returns 'unauthenticated' when called with no userId — callers
   * should show a sign-in prompt rather than silently failing.
   */
  const toggle = useCallback(
    async (memeId) => {
      if (!userId) return 'unauthenticated'

      const wasFav = ids.has(memeId)

      // Optimistic UI update
      setIds((prev) => {
        const next = new Set(prev)
        wasFav ? next.delete(memeId) : next.add(memeId)
        return next
      })

      const { error } = wasFav
        ? await supabase.from('favorites').delete().eq('user_id', userId).eq('meme_id', memeId)
        : await supabase.from('favorites').insert({ user_id: userId, meme_id: memeId })

      if (error) {
        // Rollback on failure
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
