import { createContext, useContext, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

const DEFAULTS = {
  feed_tab:         true,
  stickers_tab:     true,
  amazon_affiliate: true,
}

const FeaturesContext = createContext({ flags: DEFAULTS, loading: true })

export function FeaturesProvider({ children }) {
  const [flags, setFlags] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/features`)
      .then((r) => r.json())
      .then((data) => setFlags({ ...DEFAULTS, ...data }))
      .catch(() => { /* silently keep defaults on network error */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <FeaturesContext.Provider value={{ flags, loading }}>
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  return useContext(FeaturesContext)
}
