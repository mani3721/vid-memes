import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { apiFetch } from '../lib/appwriteClient'

const LOCAL_KEY = 'videsaur.consent.v1'

/**
 * Cookie-consent state backed by localStorage, with a fire-and-forget sync to
 * the API (Appwrite) when the user is signed in. localStorage stays the
 * source of truth for rendering.
 *
 * @param {string|null} userId — from useAuth(); pass null for guests
 */
export function useConsent(userId) {
  const [localChoice, setLocalChoice] = useLocalStorage(LOCAL_KEY, null)

  const persistToDb = useCallback(
    (status) => {
      if (!userId) return
      apiFetch('/api/me/consent', { method: 'PUT', body: { status } })
        .catch((err) => console.warn('[consent] sync failed:', err.message))
    },
    [userId],
  )

  const acceptAll = useCallback(() => {
    setLocalChoice('granted')
    persistToDb('granted')
  }, [setLocalChoice, persistToDb])

  const rejectAll = useCallback(() => {
    setLocalChoice('denied')
    persistToDb('denied')
  }, [setLocalChoice, persistToDb])

  const reset = useCallback(() => setLocalChoice(null), [setLocalChoice])

  return useMemo(
    () => ({
      choice: localChoice,
      decided: localChoice !== null,
      adsAllowed: localChoice === 'granted',
      acceptAll,
      rejectAll,
      reset,
    }),
    [localChoice, acceptAll, rejectAll, reset],
  )
}
