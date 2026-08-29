import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { StudioContext } from './studioStore'

const DEFAULT_KITS = [
  { id: 'k1', name: 'YouTube Intro Pack', assetIds: ['a3', 'a11', 'a27'] },
  { id: 'k2', name: 'Reaction Cutaways', assetIds: ['a5', 'a19'] },
]

/** Owns everything both modes share: mode, selection, kits, download streak. */
export function StudioProvider({ children }) {
  // Returning users land back in the mode they left in.
  const [mode, setMode] = useLocalStorage('msf.mode', 'browse')
  const [kits, setKits] = useLocalStorage('msf.kits', DEFAULT_KITS)
  const [downloads, setDownloads] = useLocalStorage('msf.downloads', 0)

  // Selection is deliberately session-only — stale checkboxes across reloads
  // would be more confusing than helpful.
  const [selected, setSelected] = useState(() => new Set())
  const [mood, setMood] = useState(null)
  const [query, setQuery] = useState('')

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const selectMany = useCallback((ids) => setSelected(new Set(ids)), [])

  const registerDownload = useCallback(
    (count = 1) => setDownloads((n) => n + count),
    [setDownloads],
  )

  const addToKit = useCallback(
    (kitId, assetIds) => {
      setKits((prev) =>
        prev.map((kit) =>
          kit.id === kitId
            ? { ...kit, assetIds: [...new Set([...kit.assetIds, ...assetIds])] }
            : kit,
        ),
      )
    },
    [setKits],
  )

  const createKit = useCallback(
    (name, assetIds = []) => {
      const id = `k${Math.random().toString(36).slice(2, 8)}`
      setKits((prev) => [...prev, { id, name, assetIds }])
      return id
    },
    [setKits],
  )

  const removeKit = useCallback(
    (kitId) => setKits((prev) => prev.filter((kit) => kit.id !== kitId)),
    [setKits],
  )

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selected,
      toggleSelect,
      clearSelection,
      selectMany,
      mood,
      setMood,
      query,
      setQuery,
      downloads,
      registerDownload,
      kits,
      addToKit,
      createKit,
      removeKit,
    }),
    [
      mode,
      setMode,
      selected,
      toggleSelect,
      clearSelection,
      selectMany,
      mood,
      query,
      downloads,
      registerDownload,
      kits,
      addToKit,
      createKit,
      removeKit,
    ],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}
