import { useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 24
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/**
 * Meme reads go through the API server (server/routes/memes.js), which reads
 * Appwrite with its server key and enforces is_published. Resolves to
 * { data, count, error } so the call sites keep their old Supabase shape.
 */
function fetchMemes(params) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    qs.set(k, Array.isArray(v) ? v.join(',') : String(v))
  }
  return fetch(`${API_BASE}/api/memes?${qs}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((j) => ({ data: j.memes ?? [], count: j.total ?? 0, error: null }))
    .catch((err) => ({ data: null, count: 0, error: err }))
}

function getJson(path) {
  return fetch(`${API_BASE}${path}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
}

/**
 * Map snake_case columns to the camelCase shape the rest of the app
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
    isHot: m.is_hot ?? false,
    r2Key: m.r2_key,
    mood: m.mood_tags?.[0] ?? null,
    createdAt: m.created_at ?? null,
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
 * useTrendingMemes — home feed sorted by download_count DESC, page-based.
 */
export function useTrendingMemes({ limit = PAGE_SIZE, excludeCategory } = {}) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const exCatKey = JSON.stringify(excludeCategory)
  const prevFilters = useRef({ exCatKey, limit })

  useEffect(() => {
    if (exCatKey !== prevFilters.current.exCatKey || limit !== prevFilters.current.limit) {
      prevFilters.current = { exCatKey, limit }
      setPage(1)
    }
  }, [exCatKey, limit])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const q = fetchMemes({ sort: 'hot', limit, offset: (page - 1) * limit, excludeCategory })

    q.then(({ data, error: err, count }) => {
      if (cancelled) return
      if (err) setError(err.message)
      else {
        setMemes((data ?? []).map(normalize))
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, exCatKey])

  const totalPages = Math.ceil(totalCount / limit) || 1
  return { memes, loading, error, page, totalPages, setPage }
}

/**
 * useCategoryMemes — filtered by category, mood array, and/or title search.
 * Re-queries automatically when any filter changes. Page-based pagination.
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
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const filterKey = JSON.stringify({ category, excludeCategory, mood, query, limit })
  const prevFilterKey = useRef(filterKey)

  useEffect(() => {
    if (filterKey !== prevFilterKey.current) {
      prevFilterKey.current = filterKey
      setPage(1)
    }
  }, [filterKey])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const q = fetchMemes({
      sort: 'hot',
      limit,
      offset: (page - 1) * limit,
      category,
      excludeCategory,
      mood,
      q: query?.trim(),
    })

    q.then(({ data, error: err, count }) => {
      if (cancelled) return
      if (err) setError(err.message)
      else {
        setMemes((data ?? []).map(normalize))
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey])

  const totalPages = Math.ceil(totalCount / limit) || 1
  return { memes, loading, error, page, totalPages, setPage }
}

/**
 * useMixedFeed — home feed with pluggable sort modes:
 *
 *  'mixed'    (default) — recent uploads (last 7 days) fill the page first;
 *             popular memes backfill any remaining slots and take over once the
 *             recent pool is exhausted.
 *  'recent'   — all memes, newest upload first (created_at DESC).
 *  'popular'  — all memes, most downloaded first (download_count DESC).
 *  'hot'      — hot-flagged first, then most downloaded (is_hot + download_count).
 */
export function useMixedFeed({ mood, query, excludeCategory, sort = 'mixed' } = {}) {
  const [memes, setMemes]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const filterKey = JSON.stringify({ mood, query, excludeCategory, sort })
  const prevFilterKey = useRef(filterKey)

  useEffect(() => {
    if (filterKey !== prevFilterKey.current) {
      prevFilterKey.current = filterKey
      setPage(1)
    }
  }, [filterKey])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const from = (page - 1) * PAGE_SIZE
    const filters = { mood, q: query?.trim(), excludeCategory }

    // ── Simple single-query modes ──────────────────────────────────────────
    if (sort === 'recent' || sort === 'popular' || sort === 'hot') {
      fetchMemes({ ...filters, sort: sort === 'recent' ? 'recent' : 'hot', limit: PAGE_SIZE, offset: from })
        .then(({ data, error: err, count }) => {
          if (cancelled) return
          if (err) { setError(err.message); setLoading(false); return }
          setMemes((data ?? []).map(normalize))
          setTotalPages(Math.ceil((count ?? 0) / PAGE_SIZE) || 1)
          setLoading(false)
        })
      return () => { cancelled = true }
    }

    // ── Mixed mode: recent first, popular backfill ─────────────────────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    fetchMemes({ ...filters, sort: 'recent', since: sevenDaysAgo, limit: PAGE_SIZE, offset: from })
      .then(({ data: rData, error: rErr, count: rCount }) => {
        if (cancelled) return
        if (rErr) { setError(rErr.message); setLoading(false); return }

        const recentItems = (rData ?? []).map(normalize)
        const totalRecent = rCount ?? 0
        const recentPages = Math.ceil(totalRecent / PAGE_SIZE) || 1
        const need        = PAGE_SIZE - recentItems.length

        if (need <= 0) {
          setMemes(recentItems)
          setTotalPages(recentPages + 1)
          setLoading(false)
          return
        }

        const recentShownSoFar   = Math.min(totalRecent, from)
        const backfillUsedBefore = Math.max(0, (page - 1) * PAGE_SIZE - recentShownSoFar)
        const recentIds          = new Set(recentItems.map((m) => m.id))

        fetchMemes({ ...filters, sort: 'hot', limit: need + 5, offset: backfillUsedBefore })
          .then(({ data: pData, error: pErr, count: pCount }) => {
            if (cancelled) return
            if (pErr) { setError(pErr.message); setLoading(false); return }

            const uniquePopular = (pData ?? [])
              .map(normalize)
              .filter((m) => !recentIds.has(m.id))
              .slice(0, need)

            setMemes([...recentItems, ...uniquePopular])
            setTotalPages(recentPages + (Math.ceil((pCount ?? 0) / PAGE_SIZE) || 1))
            setLoading(false)
          })
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey])

  return { memes, loading, error, page, totalPages, setPage }
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
    getJson(`/api/memes/by-ids?ids=${encodeURIComponent(ids.slice(0, 100).join(','))}`)
      .then(({ memes: rows }) => setMemes((rows ?? []).map(normalize)))
      .catch(() => setMemes([]))
      .finally(() => setLoading(false))
  }, [key])

  return { memes, loading }
}

/**
 * useTodayTrending — today's most-downloaded memes, newest window first.
 *
 * Reads GET /api/trending/today rather than querying download_events from the
 * browser. That table is service-role-only under RLS, so the anon key returns
 * an empty set with no error — the previous client-side version therefore
 * counted zero events every time and silently served the all-time list while
 * labelling itself a daily ranking. Aggregating server-side is also what keeps
 * a per-download audit log (which records country) off the public API.
 *
 * Refreshes every 5 minutes; the endpoint caches for 60s.
 */
export function useTodayTrending({ limit = 10, excludeCategory } = {}) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    let cancelled = false

    const params = new URLSearchParams({ limit: String(limit) })
    if (excludeCategory) params.set('excludeCategory', excludeCategory)
    const url = `${API_BASE}/api/trending/today?${params.toString()}`

    function load() {
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(({ memes: rows, isFallback: fallback }) => {
          if (cancelled) return
          setMemes(
            (rows ?? []).map((m) => ({
              ...normalize(m),
              // null (not 0) when the server fell back, so the UI can tell
              // "no downloads today" apart from "not a today ranking".
              todayDownloads: fallback ? null : m.today_downloads ?? 0,
            })),
          )
          setIsFallback(Boolean(fallback))
          setLastUpdated(new Date())
          setLoading(false)
        })
        .catch(() => {
          // Leave whatever was last shown in place; a ranking is not worth an
          // error state on the page.
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const timer = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [limit, excludeCategory])

  return { memes, loading, lastUpdated, isFallback }
}

/**
 * useSimilarMemes — mood-aware "you might also like" query.
 * Tries category + mood overlap first; falls back to category only if sparse.
 */
export function useSimilarMemes({ category, moodTags = [], excludeId, limit = 14 } = {}) {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!category || !excludeId) return
    setLoading(true)

    const qs = new URLSearchParams({ category, limit: String(limit) })
    if (moodTags.length > 0) qs.set('moods', moodTags.join(','))

    getJson(`/api/memes/${encodeURIComponent(excludeId)}/similar?${qs}`)
      .then(({ memes: rows }) => setMemes((rows ?? []).map(normalize)))
      .catch(() => {})
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, excludeId, JSON.stringify(moodTags), limit])

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
    setError(null)
    getJson(`/api/memes/${encodeURIComponent(id)}`)
      .then(({ meme: row }) => setMeme(row ? normalize(row) : null))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { meme, loading, error }
}
