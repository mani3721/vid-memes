/**
 * Lightweight guest session.
 *
 * Every visitor — signed in or not — gets a random anonymous ID persisted in
 * localStorage. It carries no personal data and is never tied to an identity;
 * it exists so guest-visible state (reaction history, dismissed prompts, last
 * language choice) survives a reload, and so the server can rate-limit
 * reactions per browser instead of demanding an account.
 *
 * localStorage rather than a cookie: this ID is only ever read by the client
 * and sent explicitly in a request body, so it does not need to ride along on
 * every request. The server also sets its own `videsaur_sid` HttpOnly cookie
 * (see server/routes/favorites.js) which is what rate limiting actually trusts
 * — this ID is the weaker, client-supplied hint used for dedupe only.
 */

const GUEST_ID_KEY = 'videsaur_guest_id'
const PREFS_KEY = 'videsaur_guest_prefs'

function randomId() {
  // crypto.randomUUID is unavailable on older Safari and on plain-HTTP origins
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `g-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/** Stable per-browser anonymous ID. Created on first call. */
export function getGuestId() {
  try {
    const existing = localStorage.getItem(GUEST_ID_KEY)
    if (existing) return existing
    const fresh = randomId()
    localStorage.setItem(GUEST_ID_KEY, fresh)
    return fresh
  } catch {
    // Private mode: fall back to a per-tab ID so dedupe still works this visit
    if (!globalThis.__videsaurGuestId) globalThis.__videsaurGuestId = randomId()
    return globalThis.__videsaurGuestId
  }
}

/**
 * Guest preferences that should outlive a reload but never require an account
 * (last language/category selection, dismissed sign-in prompts).
 */
export function readGuestPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeGuestPref(key, value) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...readGuestPrefs(), [key]: value }))
  } catch {
    // Storage unavailable — preferences are best-effort.
  }
}

/**
 * Everything the guest accumulated locally, for the merge-on-sign-in flow.
 * Read by FavoritesProvider after a guest signs in.
 */
export function readGuestState() {
  return { guestId: getGuestId(), prefs: readGuestPrefs() }
}

export { GUEST_ID_KEY, PREFS_KEY }
