import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'
import { getGuestId, readGuestPrefs } from '../lib/guestSession'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'
const PER_PAGE = 24

// Shared identity for the "no results yet" case, so a key mismatch does not
// hand useMemo a brand-new array on every render.
const EMPTY = []

/**
 * KLIPY's `locale` is an ISO 3166-1 alpha-2 *country* code, not a language
 * tag, so the site's language preference has to be mapped to a region.
 *
 * Tamil is not one of KLIPY's supported search/localisation languages (their
 * list covers Hindi, Bengali and Urdu but not Tamil — see server/docs/KLIPY.md),
 * so `ta` cannot return Tamil-localised results. Mapping it to `in` is the
 * honest best effort: it biases trending toward India, and KLIPY localises
 * *search* off the script of the query itself, so a query typed in Tamil still
 * gets whatever Tamil-adjacent matches exist. Add rows here if a language
 * toggle lands later; anything unmapped sends no locale at all, which lets
 * KLIPY geo-detect rather than guessing wrong.
 */
const LOCALE_BY_LANGUAGE = { ta: 'in', en: 'us' }

export function localeForLanguage(language) {
  return LOCALE_BY_LANGUAGE[language] ?? null
}

function pick(file, sizes, formats) {
  for (const size of sizes) {
    for (const format of formats) {
      const candidate = file?.[size]?.[format]
      if (candidate?.url) return { ...candidate, format }
    }
  }
  return null
}

/**
 * Flatten one KLIPY item into what a card needs.
 *
 * URLs are copied through untouched — KLIPY's integration terms require their
 * media URLs, including query parameters, to be used exactly as returned.
 */
function normalise(item) {
  // Grid: md/sm animated WebP first (a fraction of the bytes of the equivalent
  // GIF), GIF as the fallback for browsers without animated-WebP support.
  const preview = pick(item.file, ['md', 'sm', 'hd'], ['webp', 'gif', 'png'])
  // Download: full quality, and GIF first because it is the format that
  // actually pastes into WhatsApp/Discord/Slack.
  const download = pick(item.file, ['hd', 'md', 'sm'], ['gif', 'webp', 'png'])

  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title ?? 'Sticker',
    tags: item.tags ?? [],
    blurPreview: item.blur_preview ?? null,
    previewUrl: preview?.url ?? null,
    width: preview?.width ?? null,
    height: preview?.height ?? null,
    downloadUrl: download?.url ?? null,
    downloadFormat: download?.format ?? null,
  }
}

function errorFor(status, body) {
  if (status === 503) {
    return { code: 'NOT_CONFIGURED', message: 'Stickers are not switched on yet — the server is missing its KLIPY key.' }
  }
  if (status === 429) {
    return { code: body?.code ?? 'RATE_LIMITED', message: body?.error ?? 'Too many sticker requests right now — try again in a minute.' }
  }
  return { code: body?.code ?? 'UNKNOWN', message: body?.error ?? `Could not load stickers (${status}).` }
}

/**
 * Trending stickers, or search results when `query` is non-empty.
 *
 * Every piece of state is stamped with the `requestKey` it belongs to and
 * read back through a match check, rather than being cleared by a reset
 * effect. That keeps a new search atomic: the moment the key changes the
 * render already shows an empty, loading grid for the *new* term, with no
 * frame in between where the old results sit under the new heading.
 *
 * Pages accumulate so "Load more" appends, and results stay in exactly the
 * order KLIPY returned them — their terms forbid client-side reordering or
 * filtering of a result set.
 */
export function useStickers({ query = '', language = null } = {}) {
  const debouncedQuery = useDebounce(query.trim(), 400)
  const locale = localeForLanguage(language)
  const mode = debouncedQuery ? 'search' : 'trending'
  const requestKey = `${mode}|${debouncedQuery}|${locale ?? ''}`

  const [paging, setPaging] = useState({ key: requestKey, page: 1 })
  const [result, setResult] = useState({ key: null, items: [], hasNext: false })
  const [status, setStatus] = useState({ key: null, error: null })

  const page    = paging.key === requestKey ? paging.page : 1
  const items   = result.key === requestKey ? result.items : EMPTY
  const hasNext = result.key === requestKey ? result.hasNext : false

  // Loading is derived, never assigned: `status` is stamped with the exact
  // request (term + locale + page) it settled, so anything that does not match
  // the request this render wants is, by definition, still in flight. Entering
  // the loading state therefore needs no setState at all, which is both one
  // render fewer and what keeps the effect below free of synchronous state
  // writes.
  const pageKey = `${requestKey}|${page}`
  const loading = status.key !== pageKey
  const error   = status.key === pageKey ? status.error : null

  const load = useCallback(async (key, resultKey, path, params, signal) => {
    try {
      const res = await fetch(`${API_BASE}/api/stickers/${path}?${params}`, { signal })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw Object.assign(new Error(), errorFor(res.status, body))

      const payload = body?.data ?? {}
      const fresh = (payload.data ?? []).map(normalise).filter((s) => s.previewUrl)

      setResult((prev) => {
        // Append only onto the same result set; a first page replaces it.
        // De-duped by id because two pages of a shifting trending feed can
        // legitimately overlap, and React needs unique keys.
        const base = prev.key === resultKey ? prev.items : []
        const seen = new Set(base.map((s) => s.id))
        return {
          key: resultKey,
          items: [...base, ...fresh.filter((s) => !seen.has(s.id))],
          hasNext: Boolean(payload.has_next),
        }
      })
      setStatus({ key, error: null })
    } catch (err) {
      if (err.name === 'AbortError') return
      setStatus({
        key,
        error: { code: err.code ?? 'NETWORK', message: err.message || 'Could not reach the sticker service.' },
      })
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(PER_PAGE),
      customer_id: getGuestId(),
    })
    if (locale) params.set('locale', locale)
    if (mode === 'search') params.set('q', debouncedQuery)

    load(pageKey, requestKey, mode, params, controller.signal)
    return () => controller.abort()
  }, [load, pageKey, requestKey, mode, debouncedQuery, locale, page])

  // Page 1 of a fresh set is stamped with the same key as page 2+, so
  // `loadMore` has to carry the key forward for the derived `page` to hold.
  const loadMore = useCallback(() => {
    setPaging((prev) => ({
      key: requestKey,
      page: prev.key === requestKey ? prev.page + 1 : 2,
    }))
  }, [requestKey])

  return useMemo(
    () => ({
      stickers: items,
      loading,
      error,
      hasNext,
      loadMore,
      mode,
      // The term the visible results actually correspond to — lags `query` by
      // the debounce, so headings never claim results for a half-typed word.
      activeQuery: debouncedQuery,
      /** True only while the very first page of a result set is in flight. */
      initialLoading: loading && items.length === 0,
    }),
    [items, loading, error, hasNext, loadMore, mode, debouncedQuery],
  )
}

/**
 * Tell KLIPY a sticker was shared. Fire-and-forget: it feeds their trending
 * ranking, and a failed ping must never surface to the user.
 */
export function registerStickerShare(slug, searchTerm = '') {
  if (!slug) return
  fetch(`${API_BASE}/api/stickers/share/${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: getGuestId(), q: searchTerm }),
    keepalive: true,
  }).catch(() => {})
}

/** Language the visitor last chose, if anything ever set one. */
export function useGuestLanguage() {
  return readGuestPrefs().language ?? null
}
