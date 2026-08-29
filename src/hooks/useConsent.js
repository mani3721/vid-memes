import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { supabase } from '../lib/supabaseClient'

const LOCAL_KEY = 'videsaur.consent.v1'
const CONSENT_VERSION = 'v1'

/**
 * Cookie-consent state backed by localStorage (device-local, no login required)
 * with a fire-and-forget Supabase sync when the user is authenticated.
 *
 * Local storage is always the source of truth for rendering — the DB write is
 * secondary and never blocks the UI.
 *
 * @param {string|null} userId — from useAuth(); pass null for guests
 */
export function useConsent(userId) {
  const [localChoice, setLocalChoice] = useLocalStorage(LOCAL_KEY, null)

  /** Upsert to Supabase in the background — never awaited by callers. */
  const persistToDb = useCallback(
    (status) => {
      if (!userId) return
      supabase
        .from('user_consent')
        .upsert(
          {
            user_id: userId,
            consent_status: status,
            consent_version: CONSENT_VERSION,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .then(({ error }) => {
          if (error) console.warn('[consent] Supabase sync failed:', error.message)
        })
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
