import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useCategoryMemes } from '../hooks/useMemes'
import SoundCard from './SoundCard'

export default function TrendingSoundsFeed() {
  const { memes, loading } = useCategoryMemes({ category: 'sounds', limit: 6 })

  if (!loading && memes.length === 0) return null

  return (
    <section aria-labelledby="trending-sounds-heading">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="trending-sounds-heading" className="font-display text-lg tracking-wide text-hi">
          🔊 TRENDING SOUND EFFECTS
        </h2>
        <Link
          to="/sounds"
          className="inline-flex items-center gap-1 text-xs font-medium text-mid transition-colors hover:text-brand"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10" role="status">
          <Loader2 className="size-5 animate-spin text-brand" />
          <span className="sr-only">Loading sounds…</span>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memes.map((sfx, i) => <SoundCard key={sfx.id} sfx={sfx} stagger={i % 3} />)}
        </div>
      )}
    </section>
  )
}
