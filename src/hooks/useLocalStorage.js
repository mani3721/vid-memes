import { useCallback, useState } from 'react'

/** State mirrored into localStorage. Falls back silently in private mode. */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Storage unavailable (Safari private mode) — keep in-memory state.
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
