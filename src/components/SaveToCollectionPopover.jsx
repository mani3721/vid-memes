import { useEffect, useRef, useState } from 'react'
import { Heart, Check, FolderPlus, Loader2 } from 'lucide-react'
import { useFavorites } from '../store/FavoritesProvider'
import { useCollections } from '../store/CollectionsProvider'
import CreateCollectionModal from './CreateCollectionModal'

/**
 * Popover shown when an auth user clicks the heart icon on a MemeCard.
 *
 * Layout:
 *  ─ "All Favorites" toggle (heart icon + label + checkmark when saved)
 *  ─ Divider
 *  ─ Collection rows (folder icon + name + checkmark when meme is in it)
 *  ─ "+ New Collection" quick-create row
 */
export default function SaveToCollectionPopover({ memeId, onClose }) {
  const { isFav, toggle } = useFavorites()
  const { collections, loading, addToCollection, removeFromCollection, getMemeCollectionIds } = useCollections()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pendingCollectionId, setPendingCollectionId] = useState(null)
  const panelRef = useRef(null)
  const faved = isFav(memeId)
  const memberOf = getMemeCollectionIds(memeId)

  // Close on outside click or Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  async function handleCollectionToggle(collectionId) {
    setPendingCollectionId(collectionId)
    if (memberOf.has(collectionId)) {
      await removeFromCollection(collectionId, memeId)
    } else {
      // Adding to a collection also ensures the meme is favorited
      if (!faved) toggle(memeId)
      await addToCollection(collectionId, memeId)
    }
    setPendingCollectionId(null)
  }

  function handleCreated(newCollection) {
    // Immediately add the meme to the freshly created collection
    if (!faved) toggle(memeId)
    addToCollection(newCollection.id, memeId)
    onClose()
  }

  return (
    <>
      <div
        ref={panelRef}
        role="menu"
        aria-label="Save to collection"
        className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-2xl border border-edge bg-panel shadow-xl"
      >
        {/* Arrow tip */}
        <div className="absolute bottom-[-5px] left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-sm border-b border-r border-edge bg-panel" />

        <div className="p-1.5">
          {/* All Favorites toggle */}
          <button
            type="button"
            role="menuitem"
            onClick={() => { toggle(memeId); onClose() }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-panel-hover"
          >
            <Heart
              className={`size-4 shrink-0 ${faved ? 'fill-red-500 text-red-500' : 'text-lo'}`}
            />
            <span className="flex-1 text-hi">All Favorites</span>
            {faved && <Check className="size-3.5 shrink-0 text-brand" />}
          </button>

          {collections.length > 0 && (
            <div className="my-1 border-t border-edge" />
          )}

          {/* Collection rows */}
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="size-4 animate-spin text-lo" />
            </div>
          ) : (
            collections.map((col) => {
              const inCol = memberOf.has(col.id)
              const isPending = pendingCollectionId === col.id
              return (
                <button
                  key={col.id}
                  type="button"
                  role="menuitem"
                  disabled={isPending}
                  onClick={() => handleCollectionToggle(col.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-panel-hover disabled:opacity-60"
                >
                  <span className="size-4 shrink-0 text-base leading-none" aria-hidden>
                    {col.emoji ?? '📁'}
                  </span>
                  <span className="flex-1 truncate text-hi">{col.name}</span>
                  {isPending
                    ? <Loader2 className="size-3.5 shrink-0 animate-spin text-lo" />
                    : inCol && <Check className="size-3.5 shrink-0 text-brand" />
                  }
                </button>
              )
            })
          )}

          <div className="my-1 border-t border-edge" />

          {/* New collection shortcut */}
          <button
            type="button"
            role="menuitem"
            onClick={() => setShowCreateModal(true)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-brand transition-colors hover:bg-brand/10"
          >
            <FolderPlus className="size-4 shrink-0" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
