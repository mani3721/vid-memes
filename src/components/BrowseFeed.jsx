import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import { useMixedFeed } from '../hooks/useMemes'
import { WEBSITE_SCHEMA, FAQ_SCHEMA } from '../utils/seo'
import SEO from './SEO'
import AdSlot from './AdSlot'
import MasonryFeed from './MasonryFeed'
import TodayRankingWidget from './TodayRankingWidget'
import TrendingSoundsFeed from './TrendingSoundsFeed'
import PageHeading from './PageHeading'
import HomeContentDepth from './HomeContentDepth'

const HOME_EXCLUDE = ['sounds', 'images', 'gifs']

const SORT_OPTIONS = [
  { value: 'popular', label: '⬇️ Most Downloaded' },
  { value: 'mixed',   label: '🔥 Fresh Mix' },
]

export default function BrowseFeed() {
  const { mood, query } = useStudio()
  const [sort, setSort] = useState('popular')
  const { memes, loading, error, page, totalPages, setPage } = useMixedFeed({
    mood: mood ?? undefined,
    query: query || undefined,
    excludeCategory: HOME_EXCLUDE,
    sort,
  })

  return (
    <>
      <SEO
        title="Memes Download: Free Meme Videos, GIFs &amp; Templates"
        description="Download free meme videos, GIFs, blank templates, and sound effects. No watermark, HD quality, updated daily. Perfect for creators, Reels, Shorts, and WhatsApp Status."
        keywords="meme download, meme video download, free meme download, meme templates, meme sound effects, no watermark memes, funny memes download, gif memes download"
        canonicalPath="/"
        schemas={[WEBSITE_SCHEMA, FAQ_SCHEMA]}
      />

      <div className="flex flex-col gap-5">
        {/* Page H1 — primary SEO signal, visually a tagline */}
        <div>
          <PageHeading
            level={1}
            text="Free Meme Videos, GIFs, Templates & Sound Effects"
            keyword="Free Meme"
          />
          <p className="mt-1 text-xs text-lo">No watermark · HD quality · Updated daily</p>
        </div>

        {/* Mobile: Today's Top Ranking horizontal strip */}
        <section aria-labelledby="ranking-strip-heading" className="lg:hidden">
          <h2
            id="ranking-strip-heading"
            className="mb-2 font-display text-sm tracking-widest text-lo"
          >
            🔥 TODAY&rsquo;S TOP RANKING
          </h2>
          <TodayRankingWidget variant="strip" />
        </section>

        <section aria-labelledby="feed-heading">

          {/* Sort filter pills */}
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Sort by">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  sort === opt.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-edge bg-panel text-mid hover:border-brand/50 hover:text-hi'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Initial load spinner */}
          {loading && (
            <div className="flex justify-center py-20" role="status" aria-live="polite">
              <Loader2 className="size-6 animate-spin text-brand" />
              <span className="sr-only">Loading memes…</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load memes — check your connection and try refreshing.
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && memes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-edge py-14 text-center text-sm text-lo">
              Nothing matches that mood and search. Try clearing one of them.
            </p>
          )}

          {/* Feed */}
          {!loading && !error && memes.length > 0 && (
            <MasonryFeed
              assets={memes}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </section>

        {/* Own wrapper — see AdSlot.jsx for why this trivially clears the
            structural sibling check regardless of what's inside the feed. */}
        <div>
          <AdSlot context="feed-gap" />
        </div>

        {/* Trending Sound Effects strip */}
        <TrendingSoundsFeed />

        <HomeContentDepth />
      </div>
    </>
  )
}
