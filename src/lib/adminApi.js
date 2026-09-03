/**
 * Thin fetch wrapper for the admin API.
 *
 * Every call re-reads the session rather than closing over a token: an admin
 * can sit on the dashboard long enough for the access token to rotate, and a
 * stale closure would start 401-ing halfway through a bulk edit.
 */
import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token ?? ''}`,
    'Content-Type': 'application/json',
  }
}

/**
 * @throws {Error} with the server's `error` message when the response is not ok,
 *         so callers can surface it directly instead of inventing their own.
 */
async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`${API_BASE}${path}`)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const res = await fetch(url, {
    method,
    headers: await authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let payload = null
  try {
    payload = await res.json()
  } catch {
    // A proxy error page or an empty 204 — fall through to the status check.
  }

  if (!res.ok) throw new Error(payload?.error ?? `Request failed (${res.status})`)
  return payload
}

// ── Content editor ───────────────────────────────────────────────────────────

export const listContent = (params) => request('/api/admin/content', { params })
export const getContent = (id) => request(`/api/admin/content/${id}`)
export const saveContent = (id, patch) => request(`/api/admin/content/${id}`, { method: 'PATCH', body: patch })
export const bulkEditContent = (body) => request('/api/admin/content/bulk', { method: 'POST', body })

// ── Moderation queue (existing endpoints) ────────────────────────────────────

export const listPending = () => request('/api/admin/pending')
export const approveMeme = (id) => request(`/api/admin/approve/${id}`, { method: 'POST' })
export const rejectMeme = (id) => request(`/api/admin/reject/${id}`, { method: 'DELETE' })
export const renameMeme = (id, title) => request(`/api/admin/rename/${id}`, { method: 'PATCH', body: { title } })

// ── Blog ─────────────────────────────────────────────────────────────────────

export const listPosts = (params) => request('/api/admin/blog', { params })
export const createPost = (body) => request('/api/admin/blog', { method: 'POST', body })
export const savePost = (id, patch) => request(`/api/admin/blog/${id}`, { method: 'PATCH', body: patch })
export const deletePost = (id, { hard = false } = {}) =>
  request(`/api/admin/blog/${id}`, { method: 'DELETE', params: { hard: hard ? 'true' : '' } })

// ── Sitemap ops ──────────────────────────────────────────────────────────────

export const sitemapStatus = () => request('/api/admin/sitemap/status')
export const refreshSitemap = () => request('/api/admin/sitemap/refresh', { method: 'POST' })
