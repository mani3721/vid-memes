import { createContext, useContext } from 'react'
import { useAuth } from '../lib/authContext'
import { useCollections as useCollectionsData } from '../hooks/useCollections'

const CollectionsContext = createContext(null)

export function useCollections() {
  const ctx = useContext(CollectionsContext)
  if (!ctx) throw new Error('useCollections must be used inside <CollectionsProvider>')
  return ctx
}

export function CollectionsProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const userId = authLoading ? undefined : user?.id ?? null

  const data = useCollectionsData(userId)

  return (
    <CollectionsContext.Provider value={data}>
      {children}
    </CollectionsContext.Provider>
  )
}
