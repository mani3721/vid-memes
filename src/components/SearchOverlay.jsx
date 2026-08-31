import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useStudio } from '../store/studioStore'

const SUGGESTIONS = [
  'green screen',
  'reaction clip',
  'alpha channel',
  'vine boom',
  '9:16 vertical',
  'transparent png',
  'crowd cheering',
  'cursed cat',
]

/**
 * Full-width search that takes over the navbar on focus, with live suggestion
 * chips. Escape or the scrim closes it.
 */
export default function SearchOverlay({ open, onOpen, onClose }) {
  const { query, setQuery } = useStudio()
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const matches = query
    ? SUGGESTIONS.filter((s) => s.includes(query.toLowerCase())).slice(0, 5)
    : SUGGESTIONS.slice(0, 5)

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-edge bg-panel px-3.5 text-left text-sm text-mid transition-colors duration-150 hover:border-edge/60 hover:text-hi"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{query || 'Search memes, clips, sounds…'}</span>
      </button>
    )
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 top-nav z-30 bg-canvas/80 backdrop-blur-sm"
      />

      <div className="animate-rise absolute inset-x-3 top-2.5 z-40 sm:inset-x-6">
        <div className="flex h-10 items-center gap-2 rounded-full border border-brand/60 bg-panel px-4 shadow-2xl shadow-black/50">
          <Search className="size-4 shrink-0 text-brand" />
          <label htmlFor="studio-search" className="sr-only">
            Search the library
          </label>
          <input
            id="studio-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memes, clips, sounds…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-mid focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="grid size-7 shrink-0 place-items-center rounded-full text-mid transition-colors duration-150 hover:bg-white/10 hover:text-hi"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s)
                onClose()
              }}
              className="rounded-full border border-edge bg-panel px-3 py-1.5 text-xs text-mid transition-colors duration-150 hover:border-brand hover:text-hi"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
