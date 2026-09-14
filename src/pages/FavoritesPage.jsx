import { useState } from 'react'
import { Heart, FolderPlus, Layers } from 'lucide-react'
import { useFavorites } from '../store/FavoritesProvider'
import { useCollections } from '../store/CollectionsProvider'
import { useAuth } from '../lib/authContext'
import { useMemesByIds } from '../hooks/useMemes'
import MasonryFeed from '../components/MasonryFeed'
import CollectionCard from '../components/CollectionCard'
import CreateCollectionModal from '../components/CreateCollectionModal'
import GuestPrompt from '../components/GuestPrompt'
import SEO from '../components/SEO'

const TABS = [
  { id: 'all', label: 'All Favorites', Icon: Heart },
  { id: 'collections', label: 'Collections', Icon: Layers },
]

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { ids, loading: favsLoading } = useFavorites()
  const { collections, loading: colsLoading } = useCollections()
  const { memes: favorited, loading: memesLoading } = useMemesByIds(ids)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loading = authLoading || favsLoading || memesLoading
  const isGuest = !authLoading && !user

  return (
    <>
      <SEO
        title="Your Favorites — Videsaur"
        description="All memes and videos you have saved to your favorites."
        canonicalPath="/favorites"
      />

      <div className="flex flex-col gap-5">
        {/* Page header */}
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="flex items-center gap-2 font-display text-lg tracking-wide text-hi">
            <Heart className="size-5 fill-red-500 text-red-500" />
            Your Favorites
          </h1>
          {!loading && favorited.length > 0 && activeTab === 'all' && (
            <span className="text-xs text-lo">{favorited.length} saved</span>
          )}
          {!colsLoading && activeTab === 'collections' && (
            <span className="text-xs text-lo">{collections.length} {collections.length === 1 ? 'collection' : 'collections'}</span>
          )}
        </div>

        {/*
          Guests are NOT walled off here. Their favorites live in localStorage
          and render exactly like a signed-in user's — the only difference is a
          dismissible note explaining that signing in makes them portable across
          devices. Collections are auth-user-only (tabs are hidden for guests).
        */}
        {isGuest && favorited.length > 0 && (
          <GuestPrompt
            id="favorites_page"
            message="These favorites are saved in this browser. Sign in to keep them across devices — and unlock Collections."
          />
        )}

        {/* Tab switcher — only shown to authenticated users */}
        {!isGuest && (
          <div className="flex items-center gap-1 rounded-xl bg-panel-hover p-1 w-fit">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-panel text-hi shadow-sm'
                    : 'text-mid hover:text-hi'
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── All Favorites tab ─────────────────────────────── */}
        {activeTab === 'all' && (
          <>
            {loading ? (
              <div className="py-12 text-center text-sm text-lo">Loading…</div>
            ) : favorited.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge py-20 text-center">
                <Heart className="size-10 text-lo/40" />
                <p className="text-sm text-mid">No favorites yet.</p>
                <p className="text-xs text-lo">Tap the heart on any card to save it here.</p>
                {isGuest && (
                  <p className="text-xs text-lo">
                    No account needed — signing in just keeps them across devices.
                  </p>
                )}
              </div>
            ) : (
              <MasonryFeed assets={favorited} />
            )}
          </>
        )}

        {/* ── Collections tab ───────────────────────────────── */}
        {activeTab === 'collections' && (
          <div className="flex flex-col gap-5">
            {/* Create button */}
            <div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-xl bg-brand-fill px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-fill-hover"
              >
                <FolderPlus className="size-4" />
                New Collection
              </button>
            </div>

            {colsLoading ? (
              <div className="py-12 text-center text-sm text-lo">Loading…</div>
            ) : collections.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge py-20 text-center">
                <Layers className="size-10 text-lo/40" />
                <p className="text-sm text-mid">No collections yet.</p>
                <p className="text-xs text-lo">
                  Create a collection to organise your favorites into named folders.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {collections.map((col) => (
                  <CollectionCard key={col.id} collection={col} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCollectionModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  )
}
