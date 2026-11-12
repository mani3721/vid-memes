import { apiFetch } from './appwriteClient'

const LEGACY_KEY = 'videsaur_fav_ids'

/**
 * One-time migration: lift guest favorites stored in localStorage into the
 * signed-in account. Called by FavoritesProvider right after sign-in.
 * Idempotent server-side, so re-running is always safe.
 */
export async function migrateFavorites() {
  let localIds
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return
    localIds = JSON.parse(raw)
  } catch {
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  const memeIds = Array.isArray(localIds) ? localIds.filter((id) => typeof id === 'string' && id.length > 0) : []
  if (memeIds.length === 0) {
    localStorage.removeItem(LEGACY_KEY)
    return
  }

  try {
    await apiFetch('/api/favorites/merge', { method: 'POST', body: { memeIds } })
    localStorage.removeItem(LEGACY_KEY)
  } catch (err) {
    console.warn('[migrateFavorites] merge failed:', err.message)
  }
}
