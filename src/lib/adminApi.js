/**
 * Thin fetch wrapper for the admin API.
 *
 * Every call re-reads the session rather than closing over a token: an admin
 * can sit on the dashboard long enough for the access token to rotate, and a
 * stale closure would start 401-ing halfway through a bulk edit.
 */
import { API_BASE, getJwt } from './appwriteClient'

async function authHeaders() {
  const jwt = await getJwt()
  return {
    Authorization: `Bearer ${jwt ?? ''}`,
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
export const deleteMeme = (id) => request(`/api/admin/content/${id}`, { method: 'DELETE' })
export const generateDescription = (id) => request(`/api/admin/content/${id}/generate`, { method: 'POST' })

/**
 * Downloads a ZIP of assets and hands it to the browser.
 * @param {{ ids?: string[], all?: boolean, filters?: object }} body
 * @throws {Error} with the server's message when the request is rejected.
 */
export async function downloadContentZip(body) {
  const res = await fetch(`${API_BASE}/api/admin/content/download`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.error ?? `Download failed (${res.status})`)
  }

  const disposition = res.headers.get('Content-Disposition') ?? ''
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'videsaur-admin.zip'

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick — some browsers cancel the download if revoked synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

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

// ── Announcements (broadcast notifications) ──────────────────────────────────

export const listAnnouncements = () => request('/api/admin/announcements')
export const sendAnnouncement = (body) => request('/api/admin/announcements', { method: 'POST', body })
export const updateAnnouncement = (id, body) =>
  request(`/api/admin/announcements/${id}`, { method: 'PATCH', body })

// ── Feature flags ────────────────────────────────────────────────────────────

export const listFeatureFlags = () => request('/api/admin/features')
export const setFeatureFlag = (key, enabled) =>
  request(`/api/admin/features/${key}`, { method: 'PATCH', body: { enabled } })

// ── Sitemap ops ──────────────────────────────────────────────────────────────

export const sitemapStatus = () => request('/api/admin/sitemap/status')
export const refreshSitemap = () => request('/api/admin/sitemap/refresh', { method: 'POST' })
