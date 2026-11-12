import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/appwriteClient'

/**
 * Read-only hook for a user's download history (via /api/me/download-history).
 *
 * @param {string|null} userId
 * @param {number} limit — max rows to fetch (default 50)
 */
export function useDownloadHistory(userId, limit = 50) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setHistory([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    apiFetch('/api/me/download-history', { params: { limit } })
      .then(({ history: rows }) => {
        if (!cancelled) setHistory(rows ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId, limit])

  return { history, loading }
}
