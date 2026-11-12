import { Client, Account } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID
export const projectName = import.meta.env.VITE_APPWRITE_PROJECT_NAME ?? ''

if (!endpoint || !projectId) {
  throw new Error(
    '[appwrite] Missing VITE_APPWRITE_ENDPOINT / VITE_APPWRITE_PROJECT_ID. Set them in client/.env (or Vercel env).'
  )
}

export const client = new Client().setEndpoint(endpoint).setProject(projectId)
export const account = new Account(client)

/** Ping Appwrite once at startup to confirm the SDK setup. */
let pinged = false
export function pingAppwrite() {
  if (pinged || typeof window === 'undefined') return
  pinged = true
  client
    .ping()
    .then(() => console.info('[appwrite] ping OK —', projectName || projectId, endpoint))
    .catch((err) => console.warn('[appwrite] ping failed:', err?.message ?? err))
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

// Appwrite JWTs live 15 minutes; refresh a little early.
const JWT_TTL_MS = 12 * 60 * 1000
let cached = null // { jwt, at }
let inflight = null

/** Drop the cached JWT (on sign-in / sign-out). */
export function clearJwt() {
  cached = null
  inflight = null
}

/** A JWT for the current session, or null for guests. */
export async function getJwt() {
  if (cached && Date.now() - cached.at < JWT_TTL_MS) return cached.jwt
  inflight ??= account
    .createJWT()
    .then(({ jwt }) => {
      cached = { jwt, at: Date.now() }
      return jwt
    })
    .catch(() => {
      cached = null
      return null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/**
 * fetch() against the API server with the user's JWT attached.
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
