import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, ImageIcon, Check, X } from 'lucide-react'
import { useCollections } from '../store/CollectionsProvider'
import { useMemesByIds } from '../hooks/useMemes'
import MasonryFeed from '../components/MasonryFeed'
import SEO from '../components/SEO'

function RenameForm({ current, onSave, onCancel }) {
  const [value, setValue] = useState(current)

  function handleSubmit(e) {
    e.preventDefault()
    if (value.trim()) onSave(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={100}
        className="rounded-xl border border-edge bg-panel-hover px-3 py-1.5 text-sm text-hi outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <button
        type="submit"
        aria-label="Save name"
        className="grid size-7 place-items-center rounded-full bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
      >
        <Check className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel rename"
        className="grid size-7 place-items-center rounded-full text-lo hover:bg-panel-hover transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </form>
  )
}

export default function CollectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { collections, loading: colsLoading, renameCollection, deleteCollection } = useCollections()
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const collection = collections.find((c) => c.id === id)
  const memeIds = collection?.items.map((item) => item.meme_id) ?? []
  const { memes, loading: memesLoading } = useMemesByIds(memeIds)

  const loading = colsLoading || memesLoading

  async function handleDelete() {
    setDeleting(true)
    await deleteCollection(id)
    navigate('/favorites', { replace: true })
  }

  if (!colsLoading && !collection) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-sm text-mid">Collection not found.</p>
        <Link to="/favorites" className="text-xs text-brand hover:underline">
          Back to Favorites
        </Link>
      </div>
    )
  }

  const displayName = collection?.name ?? '…'
  const displayEmoji = collection?.emoji
  const isDefault = collection?.isDefault ?? false

  return (
    <>
      <SEO
        title={`${displayName} — Collections — Videsaur`}
        description={`Memes saved to your "${displayName}" collection.`}
        canonicalPath={`/favorites/collection/${id}`}
      />

      <div className="flex flex-col gap-5">
        {/* Back link */}
        <Link
          to="/favorites"
          className="flex items-center gap-1.5 text-xs text-lo hover:text-hi transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Favorites
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {displayEmoji && (
              <span className="text-2xl leading-none" aria-hidden>{displayEmoji}</span>
            )}
            {renaming ? (
              <RenameForm
                current={displayName}
                onSave={async (newName) => {
                  await renameCollection(id, newName)
                  setRenaming(false)
                }}
                onCancel={() => setRenaming(false)}
              />
            ) : (
              <h1 className="font-display text-lg tracking-wide text-hi">{displayName}</h1>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!renaming && (
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-mid hover:bg-panel-hover transition-colors"
              >
                <Pencil className="size-3.5" />
                Rename
              </button>
            )}
            {!isDefault && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
            <p className="flex-1 text-hi">
              Delete &ldquo;{displayName}&rdquo;? The memes themselves won&apos;t be deleted — only
              this folder.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-xl px-3 py-1.5 text-xs text-mid hover:bg-panel-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-sm text-lo">Loading…</div>
        ) : memes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge py-20 text-center">
            <ImageIcon className="size-10 text-lo/40" />
            <p className="text-sm text-mid">Nothing saved here yet.</p>
            <p className="text-xs text-lo">
              Start adding memes — tap the heart on any card and pick this collection.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-lo">
              {memes.length} {memes.length === 1 ? 'item' : 'items'}
            </p>
            <MasonryFeed assets={memes} />
          </>
        )}
      </div>
    </>
  )
}
