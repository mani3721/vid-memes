import { createContext, useContext } from 'react'

export const STORAGE_KEY = 'videsaur.consent.v1'

/** Split from the provider so Fast Refresh stays intact. */
export const ConsentContext = createContext(null)

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside <ConsentProvider>')
  return ctx
}
