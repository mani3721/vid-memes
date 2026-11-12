import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { apiFetch } from '../lib/appwriteClient'
import { AUTH_EVENT } from '../lib/authContext'
import { ConsentContext, STORAGE_KEY } from './consentStore'

/**
 * Consent gate for advertising and analytics cookies.
 *
 * localStorage is always the source of truth for rendering — no round-trip delay.
 * When the user is signed in, decisions are additionally synced to the
 * user_consent table (Appwrite, via /api/me/consent) as a background write.
 *
 * ConsentProvider lives outside AuthProvider in the component tree, so it
 * listens for the auth event AuthProvider dispatches instead of useAuth().
 */
export function ConsentProvider({ children }) {
  const [choice, setChoice] = useLocalStorage(STORAGE_KEY, null)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const onAuth = (e) => setUserId(e.detail?.userId ?? null)
    window.addEventListener(AUTH_EVENT, onAuth)
    return () => window.removeEventListener(AUTH_EVENT, onAuth)
  }, [])

  /** Fire-and-forget sync — never blocks the UI. */
  const persistToDb = useCallback(
    (status) => {
      if (!userId) return
      apiFetch('/api/me/consent', { method: 'PUT', body: { status } })
        .catch((err) => console.warn('[consent] sync failed:', err.message))
    },
    [userId],
  )

  const acceptAll = useCallback(() => {
    setChoice('granted')
    persistToDb('granted')
  }, [setChoice, persistToDb])

  const rejectAll = useCallback(() => {
    setChoice('denied')
    persistToDb('denied')
  }, [setChoice, persistToDb])

  const reset = useCallback(() => setChoice(null), [setChoice])

  const value = useMemo(
    () => ({
      choice,
      decided: choice !== null,
      adsAllowed: choice === 'granted',
      acceptAll,
      rejectAll,
      reset,
    }),
    [choice, acceptAll, rejectAll, reset],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
