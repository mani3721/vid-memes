import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'
const NS_MEDIA = 'http://search.yahoo.com/mrss/'

function parseFeed(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  return Array.from(doc.querySelectorAll('entry')).map(entry => {
    const id        = entry.querySelector('id')?.textContent?.trim() ?? ''
    const title     = entry.querySelector('title')?.textContent?.trim() ?? ''
    const link      = entry.querySelector('link')?.getAttribute('href') ?? ''
    const author    = entry.querySelector('author name')?.textContent?.trim() ?? ''
    const subreddit = entry.querySelector('category')?.getAttribute('term') ?? ''

    // Prefer media:content (full size) over media:thumbnail
    const contentEl = entry.getElementsByTagNameNS(NS_MEDIA, 'content')[0]
    const thumbEl   = entry.getElementsByTagNameNS(NS_MEDIA, 'thumbnail')[0]
    let image = contentEl?.getAttribute('url') ?? thumbEl?.getAttribute('url') ?? null

    // Fallback: first <img> inside the embedded HTML content
    if (!image) {
      const html = entry.querySelector('content')?.textContent ?? ''
      if (html) {
        const tmp = new DOMParser().parseFromString(html, 'text/html')
        image = tmp.querySelector('img')?.getAttribute('src') ?? null
      }
    }

    // Detect Reddit-hosted video (v.redd.it) — can't embed without OAuth;
    // show the thumbnail as poster and a "Watch on Reddit" overlay.
    const isVideo = link.includes('v.redd.it') ||
                    /\.(mp4|webm|gifv)$/i.test(image ?? '')

    return { id, title, link, author, image, isVideo, subreddit }
  })
}

export function useRedditFeed(subreddit = 'memes') {
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [fetchedAt, setFetchedAt] = useState(null)
  const [fromCache, setFromCache] = useState(false)

  // Track IDs shown so Refresh only surfaces genuinely new posts
  const seenIds = useRef(new Set())

  const fetchPosts = useCallback(async (force = false, keepSeen = false) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const url = `${API_BASE}/api/reddit-feed?sub=${subreddit}${force ? '&force=true' : ''}`
      const res = await fetch(url, {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      })
      const ct  = res.headers.get('content-type') ?? ''

      if (!res.ok) {
        // Error response is JSON from our server
        if (ct.includes('json')) {
          const body = await res.json().catch(() => ({}))
          throw Object.assign(new Error(body.error ?? `${res.status}`), { code: body.code })
        }
        throw Object.assign(new Error(`Server error ${res.status}`), { code: 'SERVER_ERROR' })
      }

      if (!ct.includes('xml')) {
        throw Object.assign(
          new Error('Unexpected response — restart the server and try again'),
          { code: 'INVALID_RESPONSE' }
        )
      }

      const xml  = await res.text()
      const all  = parseFeed(xml)

      if (!keepSeen) seenIds.current = new Set()

      const fresh = all.filter(p => !seenIds.current.has(p.id))
      fresh.forEach(p => seenIds.current.add(p.id))

      setFromCache(res.headers.get('X-Cache') === 'HIT')
      setFetchedAt(new Date())
      setPosts(prev => keepSeen ? [...prev, ...fresh] : fresh)
    } catch (e) {
      setError({ message: e.message, code: e.code ?? 'UNKNOWN' })
    } finally {
      setLoading(false)
    }
  }, [subreddit])

  // Reset and reload when subreddit changes
  useEffect(() => {
    seenIds.current = new Set()
    setPosts([])
    setFetchedAt(null)
    fetchPosts(false, false)
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    fetchedAt,
    fromCache,
    // Refresh: force-bypass cache, reset seen so full fresh batch is shown
    refresh: () => fetchPosts(true, false),
    // Load more: force new fetch, keep existing posts, append only unseen
    loadMore: () => fetchPosts(true, true),
  }
}
