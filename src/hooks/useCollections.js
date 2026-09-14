import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

function sortByAddedAt(items) {
  return [...items].sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
}

function normalizeCollection(col) {
  const items = sortByAddedAt(col.collection_items ?? [])
  return {
    id: col.id,
    name: col.name,
    emoji: col.emoji ?? null,
    isDefault: col.is_default ?? false,
    createdAt: col.created_at,
    items,
    itemCount: items.length,
    latestThumbnail: items[0]?.memes?.thumbnail_url ?? null,
    latestTitle: items[0]?.memes?.title ?? null,
  }
}

/**
 * Supabase-backed collections for authenticated users.
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

    supabase
      .from('collections')
      .select(`
        id, name, emoji, is_default, created_at,
        collection_items (
          meme_id,
          added_at,
          memes ( thumbnail_url, title )
        )
      `)
      .eq('user_id', userId)
      .order('is_default', { ascending: false }) // default collection first
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setCollections(data.map(normalizeCollection))
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId, refreshKey])

  const createCollection = useCallback(async ({ name, emoji = null }) => {
    if (!userId) return null
    const trimmed = name.trim()
    if (!trimmed) return null
    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: userId, name: trimmed, emoji })
      .select()
      .single()
    if (!error) reload()
    return error ? null : data
  }, [userId, reload])

  const renameCollection = useCallback(async (collectionId, newName) => {
    if (!userId) return
    const trimmed = newName.trim()
    if (!trimmed) return
    await supabase
      .from('collections')
      .update({ name: trimmed })
      .eq('id', collectionId)
      .eq('user_id', userId)
    reload()
  }, [userId, reload])

  const deleteCollection = useCallback(async (collectionId) => {
    if (!userId) return
    // Cascade on collection_items is handled by DB foreign key — only the
    // collection row and its items are removed; the memes themselves survive.
    await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', userId)
    reload()
  }, [userId, reload])

  const addToCollection = useCallback(async (collectionId, memeId) => {
    if (!userId) return
    await supabase
      .from('collection_items')
      .upsert(
        { collection_id: collectionId, meme_id: memeId, user_id: userId },
        { onConflict: 'collection_id,meme_id' },
      )
    reload()
  }, [userId, reload])

  const removeFromCollection = useCallback(async (collectionId, memeId) => {
    if (!userId) return
    await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('meme_id', memeId)
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
