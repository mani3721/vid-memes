import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Read-only hook for a user's download history.
 * Inserts are handled server-side (service-role key) via /api/track-download.
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

    setLoading(true)
    supabase
      .from('download_history')
      .select('meme_id, downloaded_at')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!error && data) setHistory(data)
        setLoading(false)
      })
  }, [userId, limit])

  return { history, loading }
}
