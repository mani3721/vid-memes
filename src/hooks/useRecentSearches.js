import { useState, useCallback } from 'react'

const KEY = 'videsaur_recent_searches'
const MAX = 8

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Ignore quota/private-mode write failures — recent searches are best-effort.
  }
}

export function useRecentSearches() {
  const [recents, setRecents] = useState(load)

  const add = useCallback((q) => {
    const trimmed = q.trim()
    if (!trimmed || trimmed.length < 2) return
    setRecents((prev) => {
      const deduped = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, MAX)
      persist(deduped)
      return deduped
    })
  }, [])

  const remove = useCallback((q) => {
    setRecents((prev) => {
      const next = prev.filter((x) => x !== q)
      persist(next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    persist([])
    setRecents([])
  }, [])

  return { recents, add, remove, clear }
}
