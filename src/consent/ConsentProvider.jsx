import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { supabase } from '../lib/supabaseClient'
import { ConsentContext, STORAGE_KEY } from './consentStore'

const CONSENT_VERSION = 'v1'

/**
 * Consent gate for advertising and analytics cookies.
 *
 * localStorage is always the source of truth for rendering — no round-trip delay.
 * When the user is authenticated, decisions are additionally synced to the
 * user_consent table in Supabase as a fire-and-forget background write.
 *
 * ConsentProvider lives outside AuthProvider in the component tree, so it
 * subscribes to Supabase auth state directly rather than via useAuth().
 */
export function ConsentProvider({ children }) {
  const [choice, setChoice] = useLocalStorage(STORAGE_KEY, null)
  const [userId, setUserId] = useState(null)

  // Track Supabase auth state independently (outside AuthProvider scope)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  /** Fire-and-forget Supabase sync — never blocks the UI. */
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
