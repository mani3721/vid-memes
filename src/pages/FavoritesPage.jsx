import { Heart } from 'lucide-react'
import { useFavorites } from '../store/FavoritesProvider'
import { useAuth } from '../lib/authContext'
import { useMemesByIds } from '../hooks/useMemes'
import MasonryFeed from '../components/MasonryFeed'
import GuestPrompt from '../components/GuestPrompt'
import SEO from '../components/SEO'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { ids, loading: favsLoading } = useFavorites()
  const { memes: favorited, loading: memesLoading } = useMemesByIds(ids)

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
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="flex items-center gap-2 font-display text-lg tracking-wide text-hi">
            <Heart className="size-5 fill-red-500 text-red-500" />
            Your Favorites
          </h1>
          {!loading && favorited.length > 0 && (
            <span className="text-xs text-lo">{favorited.length} saved</span>
          )}
        </div>

        {/*
          Guests are NOT walled off here. Their favorites live in localStorage
          (see hooks/useFavorites.js) and render exactly like a signed-in
          user's — the only difference is a dismissible note explaining that
          signing in makes them portable across devices.
        */}
        {isGuest && favorited.length > 0 && (
          <GuestPrompt
            id="favorites_page"
            message="These favorites are saved in this browser. Sign in to keep them across devices."
          />
        )}

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
      </div>
    </>
  )
}
