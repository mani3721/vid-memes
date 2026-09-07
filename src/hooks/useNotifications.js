import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/** How often the badge re-checks the server. */
const POLL_MS = 60_000

export const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new_content', label: 'New Content' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'system', label: 'System' },
]

async function authFetch(path, { method = 'GET', body, signal } = {}) {
  // Re-read the session per call rather than closing over a token: a tab can
  // sit open long enough for the access token to rotate, and a stale closure
  // would start 401-ing silently.
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not signed in')

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok) throw new Error(payload?.error ?? `Request failed (${res.status})`)
  return payload
}

/**
 * Unread badge count, polled.
 *
 * Polling rather than a websocket: the payload is a single integer and the
 * acceptable staleness is a minute, so a subscription would be more moving
 * parts for no perceptible gain. Guests never poll — the effect returns early
 * and the count reads 0, because the bell is not rendered for them at all.
 */
export function useUnreadCount() {
  const { user } = useAuth()
  const [fetched, setFetched] = useState(0)

  // Derived rather than cleared in an effect on sign-out: a signed-out user's
  // count is always 0, so there is no state to reset.
  const count = user ? fetched : 0

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const { count: n } = await authFetch('/api/notifications/unread-count')
      setFetched(Number(n) || 0)
    } catch {
      // Badge is decoration — a failed probe must never surface as an error.
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    let timer = null

    async function tick() {
      if (cancelled) return
      await refresh()
      if (!cancelled) timer = setTimeout(tick, POLL_MS)
    }

    tick()

    // Re-check on tab focus so someone returning after an hour sees a current
    // badge immediately instead of waiting out the interval.
    function onVisible() {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user, refresh])

  return { count, refresh, clear: () => setFetched(0) }
}

/**
 * Paginated notification list.
 *
 * The hook owns the active filter and exposes setType, rather than taking the
 * filter as a prop. That is what lets changing tabs reset the page number and
 * clear the list in one event handler — as a prop it would need a
 * reset-on-change effect, which fires a second render pass and briefly shows
 * the previous tab's rows under the new tab's heading.
 *
 * `mode: 'preview'` fetches one short page for the header dropdown;
 * `mode: 'page'` accumulates pages behind a Load more button.
 */
export function useNotificationList({
  initialType = 'all',
  limit = 20,
  mode = 'page',
  enabled = true,
} = {}) {
  const { user } = useAuth()
  const [cursor, setCursor] = useState({ type: initialType, page: 1 })
  const [fetched, setFetched] = useState([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const active = enabled && Boolean(user)
  // Derived, so turning the dropdown off does not need an effect to empty it.
  const items = active ? fetched : []

  const { type, page } = cursor

  useEffect(() => {
    if (!active) return

    const controller = new AbortController()

    authFetch(
      `/api/notifications?type=${encodeURIComponent(type)}&page=${page}&limit=${limit}`,
      { signal: controller.signal },
    )
      .then(({ notifications, hasMore: more }) => {
        // Page 1 replaces; later pages append. Preview mode only ever asks
        // for page 1, so it is always a replace.
        setFetched((prev) =>
          page === 1 || mode === 'preview' ? notifications : [...prev, ...notifications],
        )
        setHasMore(Boolean(more))
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [active, type, page, limit, mode])

  // Loading flips to true in these handlers rather than in the effect above,
  // so the spinner appears on the interaction that caused the fetch.
  const setType = useCallback((next) => {
    setCursor((c) => (c.type === next ? c : { type: next, page: 1 }))
    setFetched([])
    setHasMore(false)
    setLoading(true)
  }, [])

  const loadMore = useCallback(() => {
    setLoading(true)
    setCursor((c) => ({ ...c, page: c.page + 1 }))
  }, [])

  /** Optimistically mark one read, then persist. */
  const markRead = useCallback(async (id) => {
    setFetched((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: 'POST' })
    } catch {
      setFetched((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }
  }, [])

  const markAllRead = useCallback(async () => {
    // Snapshot from the closure, not from inside a setState updater — an
    // updater has to stay pure, and StrictMode invokes it twice in dev.
    const snapshot = fetched
    setFetched((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await authFetch('/api/notifications/read-all', { method: 'POST' })
      return true
    } catch {
      setFetched(snapshot)
      return false
    }
  }, [fetched])

  return { items, type, setType, loading, error, hasMore, loadMore, markRead, markAllRead }
}
