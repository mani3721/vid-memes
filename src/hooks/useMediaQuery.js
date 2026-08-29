import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a media query. useSyncExternalStore keeps React in sync with
 * the MediaQueryList without a resync effect, and stays correct if `query`
 * itself changes between renders.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  // Server snapshot assumes mobile, so the drawer starts closed.
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
