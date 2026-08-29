import { Heart, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../store/FavoritesProvider'
import { useAuth } from '../lib/authContext'
import { useMemesByIds } from '../hooks/useMemes'
import MasonryFeed from '../components/MasonryFeed'
import SEO from '../components/SEO'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { ids, loading: favsLoading } = useFavorites()
  const { memes: favorited, loading: memesLoading } = useMemesByIds(ids)

  const loading = authLoading || favsLoading || memesLoading

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
          {user && !loading && (
            <span className="text-xs text-lo">{favorited.length} saved</span>
          )}
        </div>

        {/* Guest state */}
        {!authLoading && !user ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-edge py-20 text-center">
            <Heart className="size-10 text-lo/40" />
            <div>
              <p className="text-sm font-medium text-mid">Save your favorites</p>
              <p className="mt-1 text-xs text-lo">Sign in to heart memes and access them from any device.</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-2"
            >
              <LogIn className="size-4" />
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-sm text-lo">Loading…</div>
        ) : favorited.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge py-20 text-center">
            <Heart className="size-10 text-lo/40" />
            <p className="text-sm text-mid">No favorites yet.</p>
            <p className="text-xs text-lo">Tap the heart on any card to save it here.</p>
          </div>
        ) : (
          <MasonryFeed assets={favorited} />
        )}
      </div>
    </>
  )
}
