import { useState, useEffect, useCallback } from 'react'
import { apiFetch, API_BASE } from '../lib/appwriteClient'

function sortByAddedAt(items) {
  return [...items].sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
}

function normalizeCollection(col, thumbMap) {
  const items = sortByAddedAt(col.items ?? [])
  const latestMemeId = items[0]?.meme_id ?? null
  const thumb = latestMemeId ? thumbMap.get(latestMemeId) : null
  return {
    id: col.id,
    name: col.name,
    emoji: col.emoji ?? null,
    isDefault: col.isDefault ?? false,
    createdAt: col.createdAt,
    items,
    itemCount: items.length,
    latestThumbnail: thumb?.thumbnail_url ?? null,
    latestTitle: thumb?.title ?? null,
  }
}

/**
 * Collections for signed-in users, via /api/collections (Appwrite).
 * Returns an empty list (no-ops on mutations) for guests.
 *
 * @param {string|null|undefined} userId — undefined while auth is loading
 */
export function useCollections(userId) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const reload = useCallback(() => setRefreshKey((n) => n + 1), [])

  useEffect(() => {
    if (userId === undefined) return
    if (!userId) {
      setCollections([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    ;(async () => {
      try {
        const { collections: cols } = await apiFetch('/api/collections')

        // One thumbnail per collection: its most recently added meme.
        const latestIds = [
          ...new Set(cols.flatMap((col) => {
            const sorted = sortByAddedAt(col.items ?? [])
            return sorted[0]?.meme_id ? [sorted[0].meme_id] : []
          })),
        ]

        const thumbMap = new Map()
        if (latestIds.length > 0) {
          const r = await fetch(`${API_BASE}/api/memes/by-ids?ids=${latestIds.map(encodeURIComponent).join(',')}`)
            .catch(() => null)
          const j = r?.ok ? await r.json().catch(() => null) : null
          for (const m of j?.memes ?? []) thumbMap.set(m.id, m)
        }

        if (!cancelled) setCollections(cols.map((col) => normalizeCollection(col, thumbMap)))
      } catch {
        // Leave the previous list in place.
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [userId, refreshKey])

  const createCollection = useCallback(async ({ name, emoji = null }) => {
    if (!userId) return null
    const trimmed = name.trim()
    if (!trimmed) return null
    try {
      const { collection } = await apiFetch('/api/collections', { method: 'POST', body: { name: trimmed, emoji } })
      reload()
      return collection
    } catch {
      return null
    }
  }, [userId, reload])

  const renameCollection = useCallback(async (collectionId, newName) => {
    if (!userId) return
    const trimmed = newName.trim()
    if (!trimmed) return
    await apiFetch(`/api/collections/${collectionId}`, { method: 'PATCH', body: { name: trimmed } }).catch(() => {})
    reload()
  }, [userId, reload])

  const deleteCollection = useCallback(async (collectionId) => {
    if (!userId) return
    // Only the collection and its items are removed; the memes survive.
    await apiFetch(`/api/collections/${collectionId}`, { method: 'DELETE' }).catch(() => {})
    reload()
  }, [userId, reload])

  const addToCollection = useCallback(async (collectionId, memeId) => {
    if (!userId) return
    await apiFetch(`/api/collections/${collectionId}/items`, { method: 'POST', body: { memeId } }).catch(() => {})
    reload()
  }, [userId, reload])

  const removeFromCollection = useCallback(async (collectionId, memeId) => {
    if (!userId) return
    await apiFetch(`/api/collections/${collectionId}/items/${encodeURIComponent(memeId)}`, { method: 'DELETE' })
      .catch(() => {})
    reload()
  }, [userId, reload])

  /** Returns the set of collection IDs that contain a given meme. */
  const getMemeCollectionIds = useCallback((memeId) => {
    return new Set(
      collections
        .filter((col) => col.items.some((item) => item.meme_id === memeId))
        .map((col) => col.id),
    )
  }, [collections])

  return {
    collections,
    loading,
    reload,
    createCollection,
    renameCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    getMemeCollectionIds,
  }
}
