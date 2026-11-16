export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/** No auth provider is configured — every visitor is a guest. */
export function clearJwt() {}

/** Always null: there is no signed-in session without an auth provider. */
export async function getJwt() {
  return null
}

/**
 * fetch() against the API server.
 * @throws {Error} with the server's `error` message when the response is not ok.
 */
export async function apiFetch(path, { method = 'GET', body, params, signal, requireAuth = true } = {}) {
  const jwt = await getJwt()
  if (requireAuth && !jwt) throw new Error('Not signed in')

  const url = new URL(`${API_BASE}${path}`)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const res = await fetch(url, {
    method,
    headers: {
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  })

  const payload = await res.json().catch(() => null)
  if (!res.ok) throw new Error(payload?.error ?? `Request failed (${res.status})`)
  return payload
}
