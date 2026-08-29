import { useEffect, useState } from 'react'

/** Delays a fast-changing value (search keystrokes) before it reaches the feed. */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
