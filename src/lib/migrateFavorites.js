import { supabase } from './supabaseClient'

const LEGACY_KEY = 'videsaur_fav_ids'

/**
 * One-time migration: lift any favorites stored in localStorage into Supabase.
 * Called automatically by FavoritesProvider right after a user signs in.
 *
 * This is a no-op on every subsequent call once the localStorage key is removed.
 * Uses upsert with ignoreDuplicates so re-running is always safe.
 */
export async function migrateFavorites(userId) {
  let localIds
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    localIds = JSON.parse(raw)
  } catch {
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  if (!Array.isArray(localIds) || localIds.length === 0) {
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  const rows = localIds
    .filter((id) => typeof id === 'string' && id.length > 0)
    .map((meme_id) => ({ user_id: userId, meme_id }))

  if (rows.length === 0) {
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  const { error } = await supabase
    .from('favorites')
    .upsert(rows, { onConflict: 'user_id,meme_id', ignoreDuplicates: true })

  if (!error) {
    localStorage.removeItem(LEGACY_KEY)
  } else {
    console.warn('[migrateFavorites] Supabase upsert failed:', error.message)
  }
}
