import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const PAGE_SIZE = 20

/**
 * Map Supabase snake_case columns to the camelCase shape the rest of the app
 * expects (MemeCard, AssetCard, BrowseFeed, etc.).
 */
function normalize(m) {
  return {
    ...m,
    // Field aliases so existing components keep working unchanged
    thumb: m.thumbnail_url,
    publicUrl: m.public_url,
    editorUses: m.download_count ?? 0,
    hasAlpha: m.has_alpha ?? false,
    greenScreen: m.green_screen ?? false,
    r2Key: m.r2_key,
    mood: m.mood_tags?.[0] ?? null,
    sizeMB: m.file_size_bytes
      ? (m.file_size_bytes / 1024 / 1024).toFixed(1)
      : '0.0',
    reactions: {
      laugh: m.laugh_count ?? 0,
      fire: m.fire_count ?? 0,
      skull: m.skull_count ?? 0,
    },
  }
}

/**
 * useTrendingMemes — home feed sorted by download_count DESC.
 * Supports "load more" via .range() pagination.
 */
export function useTrendingMemes({ limit = PAGE_SIZE, excludeCategory } = {}) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const offset = useRef(0)

  const fetchPage = useCallback(
    async (from, replace) => {
      const to = from + limit - 1
      let q = supabase
        .from('memes')
        .select('*')
        .eq('is_published', true)
        .order('download_count', { ascending: false })
        .range(from, to)
      if (excludeCategory) q = q.neq('category', excludeCategory)
      const { data, error: err } = await q

      if (err) throw new Error(err.message)
      const rows = (data ?? []).map(normalize)
      if (replace) setMemes(rows)
      else setMemes((prev) => [...prev, ...rows])
      setHasMore(rows.length === limit)
      offset.current = to + 1
      return rows
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, JSON.stringify(excludeCategory)],
  )

  useEffect(() => {
    setLoading(true)
    setError(null)
    offset.current = 0
    fetchPage(0, true)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      await fetchPage(offset.current, false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMore(false)
    }
  }, [fetchPage, hasMore, loadingMore])

  return { memes, loading, loadingMore, error, hasMore, loadMore }
}

/**
 * useCategoryMemes — filtered by category, mood array, and/or title search.
 * Re-queries automatically when any filter changes.
 * Supports "load more" via .range() pagination.
 *
 * @param {object} opts
 * @param {string} [opts.category]  — 'videos' | 'gifs' | 'images' | 'sounds'
 * @param {string} [opts.mood]      — single mood tag to filter on
 * @param {string} [opts.query]     — partial title search (case-insensitive)
 * @param {number} [opts.limit]     — rows per page
 */
export function useCategoryMemes({ category, mood, query, excludeCategory, limit = PAGE_SIZE } = {}) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const offset = useRef(0)

  const buildQuery = useCallback(
    (from) => {
      const to = from + limit - 1
      let q = supabase
        .from('memes')
        .select('*')
        .eq('is_published', true)
        .order('download_count', { ascending: false })
        .range(from, to)

      if (category) q = q.eq('category', category)
      if (excludeCategory) {
        const cats = Array.isArray(excludeCategory) ? excludeCategory : [excludeCategory]
        cats.forEach((c) => { q = q.neq('category', c) })
      }
      if (mood) q = q.contains('mood_tags', [mood])
      if (query?.trim()) q = q.ilike('title', `%${query.trim()}%`)
      return q
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [category, JSON.stringify(excludeCategory), mood, query, limit],
  )

  useEffect(() => {
    setLoading(true)
    setError(null)
    offset.current = 0

    buildQuery(0)
      .then(({ data, error: err }) => {
        if (err) throw new Error(err.message)
        const rows = (data ?? []).map(normalize)
        setMemes(rows)
        setHasMore(rows.length === limit)
        offset.current = limit
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [buildQuery, limit])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const { data, error: err } = await buildQuery(offset.current)
      if (err) throw new Error(err.message)
      const rows = (data ?? []).map(normalize)
      setMemes((prev) => [...prev, ...rows])
      setHasMore(rows.length === limit)
      offset.current += limit
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingMore(false)
    }
  }, [buildQuery, hasMore, limit, loadingMore])

  return { memes, loading, loadingMore, error, hasMore, loadMore }
}

/**
 * useMemesByIds — fetch a batch of memes by their UUIDs (for FavoritesPage).
 */
export function useMemesByIds(ids) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(false)
  const key = JSON.stringify(ids)

  useEffect(() => {
    if (!ids || ids.length === 0) { setMemes([]); return }
    setLoading(true)
    supabase
      .from('memes')
      .select('*')
      .in('id', ids)
      .eq('is_published', true)
      .then(({ data }) => setMemes((data ?? []).map(normalize)))
      .finally(() => setLoading(false))
  }, [key])

  return { memes, loading }
}

/**
 * useMemeById — single meme lookup for the detail page.
 */
export function useMemeById(id) {
  const [meme, setMeme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase
      .from('memes')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setMeme(data ? normalize(data) : null)
      })
      .finally(() => setLoading(false))
  }, [id])

  return { meme, loading, error }
}
