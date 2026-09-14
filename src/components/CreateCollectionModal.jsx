import { useState, useEffect, useRef } from 'react'
import { X, FolderPlus } from 'lucide-react'
import { useCollections } from '../store/CollectionsProvider'

const EMOJI_OPTIONS = [
  '📁', '⭐', '🔥', '💎', '🎯', '🎨', '🏆', '💡',
  '🎬', '🎮', '😂', '🤣', '💀', '🐉', '🦄', '🌟',
  '💪', '🎤', '🎵', '🍕', '🧠', '🚀', '❤️', '👑',
]

export default function CreateCollectionModal({ onClose, onCreated }) {
  const { createCollection } = useCollections()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give your collection a name.')
      return
    }
    setSaving(true)
    setError('')
    const created = await createCollection({ name, emoji })
    setSaving(false)
    if (created) {
      onCreated?.(created)
      onClose()
    } else {
      setError('Could not create collection. Try again.')
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-col-title"
        className="w-full max-w-sm rounded-2xl border border-edge bg-panel p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 id="create-col-title" className="flex items-center gap-2 font-display text-base tracking-wide text-hi">
            <FolderPlus className="size-5 text-brand" />
            New Collection
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-7 place-items-center rounded-full text-lo hover:bg-panel-hover hover:text-hi transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="col-name" className="text-xs font-medium text-mid">
              Collection name
            </label>
            <input
              id="col-name"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="e.g. Savage Replies"
              maxLength={40}
              className="w-full rounded-xl border border-edge bg-panel-hover px-3 py-2 text-sm text-hi placeholder:text-lo outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Emoji picker */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-mid">Icon (optional)</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setEmoji(null)}
                className={`grid size-8 place-items-center rounded-lg border text-xs transition-colors ${
                  emoji === null
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-edge bg-panel-hover text-lo hover:border-brand/50'
                }`}
              >
                —
              </button>
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`grid size-8 place-items-center rounded-lg border text-base transition-colors ${
                    emoji === em
                      ? 'border-brand bg-brand/10'
                      : 'border-edge bg-panel-hover hover:border-brand/50'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-mid hover:bg-panel-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-xl bg-brand-fill px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-fill-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
