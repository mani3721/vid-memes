import { createContext, useContext } from 'react'

/** Split from the provider component so Fast Refresh stays intact. */
export const StudioContext = createContext(null)

export function useStudio() {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>')
  return ctx
}
