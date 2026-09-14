import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Heart, Check, FolderPlus, Loader2 } from 'lucide-react'
import { useFavorites } from '../store/FavoritesProvider'
import { useCollections } from '../store/CollectionsProvider'
import CreateCollectionModal from './CreateCollectionModal'

const PANEL_WIDTH = 224 // w-56 = 14rem = 224px
const GAP = 8           // gap between button and panel

/**
 * Calculate a fixed-position rect for the panel so it sits above the anchor
 * button and stays within the viewport horizontally.
 */
function calcPosition(anchorEl) {
  const r = anchorEl.getBoundingClientRect()
  const centreX = r.left + r.width / 2

  // Place above the button
  const top = r.top - GAP

  // Clamp so the panel doesn't bleed past either edge (16px gutters)
  const left = Math.max(16, Math.min(centreX - PANEL_WIDTH / 2, window.innerWidth - PANEL_WIDTH - 16))

  return { top, left }
}

/**
 * Popover shown when an auth user clicks the heart icon on a MemeCard.
 * Rendered via a React portal so it escapes overflow:hidden card containers.
 *
 * Layout:
 *  ─ "All Favorites" toggle
 *  ─ Divider
 *  ─ Collection rows (checkmark when meme is already in that collection)
 *  ─ "+ New Collection" quick-create row
 */
export default function SaveToCollectionPopover({ memeId, anchorRef, onClose }) {
  const { isFav, toggle } = useFavorites()
  const { collections, loading, addToCollection, removeFromCollection, getMemeCollectionIds } = useCollections()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pendingCollectionId, setPendingCollectionId] = useState(null)
  const [style, setStyle] = useState({ visibility: 'hidden', top: 0, left: 0 })
  const panelRef = useRef(null)
  const faved = isFav(memeId)
  const memberOf = getMemeCollectionIds(memeId)

  // Position the panel on first paint, then keep it in sync on scroll/resize
  useLayoutEffect(() => {
    if (!anchorRef?.current) return

    function update() {
      const { top, left } = calcPosition(anchorRef.current)
      setStyle({ visibility: 'visible', top, left })
    }

    update()
    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [anchorRef])

  // Close on outside click or Escape — suppressed while the create-modal is
  // open so clicks inside the modal don't dismiss the whole popover.
  useEffect(() => {
    if (showCreateModal) return
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose, anchorRef, showCreateModal])

  async function handleCollectionToggle(collectionId) {
    setPendingCollectionId(collectionId)
    if (memberOf.has(collectionId)) {
      await removeFromCollection(collectionId, memeId)
    } else {
      if (!faved) toggle(memeId)
      await addToCollection(collectionId, memeId)
    }
    setPendingCollectionId(null)
  }

  function handleCreated(newCollection) {
    if (!faved) toggle(memeId)
    addToCollection(newCollection.id, memeId)
    onClose()
  }

  const panel = showCreateModal ? null : (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Save to collection"
      style={{
        position: 'fixed',
        top: style.top,
        left: style.left,
        width: PANEL_WIDTH,
        transform: 'translateY(-100%)',
        visibility: style.visibility,
        zIndex: 9999,
      }}
      className="rounded-2xl border border-edge bg-panel shadow-xl"
    >
      {/* Arrow tip pointing down toward the button */}
      <div
        aria-hidden
        style={{ left: '50%' }}
        className="absolute -bottom-1.25 size-2.5 -translate-x-1/2 rotate-45 rounded-sm border-b border-r border-edge bg-panel"
      />

      <div className="p-1.5">
        {/* All Favorites toggle */}
        <button
          type="button"
          role="menuitem"
          onClick={() => { toggle(memeId); onClose() }}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-panel-hover"
        >
          <Heart className={`size-4 shrink-0 ${faved ? 'fill-red-500 text-red-500' : 'text-lo'}`} />
          <span className="flex-1 text-hi">All Favorites</span>
          {faved && <Check className="size-3.5 shrink-0 text-brand" />}
        </button>

        {collections.length > 0 && <div className="my-1 border-t border-edge" />}

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
  )

  return (
    <>
      {createPortal(panel, document.body)}
      {showCreateModal && createPortal(
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />,
        document.body,
      )}
    </>
  )
}
