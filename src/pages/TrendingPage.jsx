import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useTrendingMemes } from '../hooks/useMemes'
import SEO from '../components/SEO'
import PageHeading from '../components/PageHeading'
import FeedToggle from '../components/FeedToggle'
import TrendingCard from '../components/TrendingCard'
import RankingList from '../components/RankingList'

const GRID_COUNT = 8
const RANK_COUNT = 20

export default function TrendingPage() {
  const { memes, loading } = useTrendingMemes({ limit: RANK_COUNT, excludeCategory: 'sounds' })
  const [totalCount, setTotalCount] = useState(null)

  useEffect(() => {
    supabase
      .from('memes')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .then(({ count }) => setTotalCount(count))
  }, [])

  const gridMemes = memes.slice(0, GRID_COUNT)
  // Mark as "Hot" if download_count >= 60% of the top item's count
  const maxDownloads = gridMemes[0]?.editorUses ?? 1
  const hotThreshold = maxDownloads * 0.6

  return (
    <>
      <SEO
        title="Trending Memes — Most Downloaded This Week"
        description="See the most downloaded meme videos, GIFs, and templates right now. Updated daily — discover what's viral across Reels, Shorts, WhatsApp, and Discord."
        keywords="trending memes, most downloaded memes, viral memes, top memes download, popular memes this week"
        canonicalPath="/trending"
      />

      <div className="flex flex-col gap-6">
        {/* Browse / Trending toggle */}
        <FeedToggle />

        {/* Page header */}
        <div>
          <PageHeading
            level={1}
            text="Trending Memes — Most Downloaded This Week"
            keyword="Trending Memes"
          />
          <p className="mt-1 text-sm text-lo">
            {totalCount !== null
              ? `${totalCount.toLocaleString()} memes`
              : '—'}{' '}
            · Updated daily
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24" role="status" aria-live="polite">
            <Loader2 className="size-6 animate-spin text-brand" />
            <span className="sr-only">Loading trending memes…</span>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/*
             * DOM order: ranking first → appears on top on mobile (scannable).
             * CSS order flips it on desktop so the grid sits on the left.
             */}

            {/* Right column on desktop / top on mobile — Most Downloaded list */}
            <section
              aria-labelledby="ranking-heading"
              className="order-1 rounded-2xl border border-edge bg-panel p-4 lg:order-2 lg:self-start lg:sticky lg:top-20"
            >
              <h2
                id="ranking-heading"
                className="mb-3 font-display text-base tracking-wide text-hi"
              >
                📈 Most Downloaded
              </h2>
              <RankingList memes={memes} />
            </section>

            {/* Left column on desktop / bottom on mobile — Top Trending Now grid */}
            <section aria-labelledby="trending-grid-heading" className="order-2 lg:order-1">
              <h2
                id="trending-grid-heading"
                className="mb-4 font-display text-base tracking-wide text-hi"
              >
                🔥 Top Trending Now
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {gridMemes.map((meme) => (
                  <TrendingCard
                    key={meme.id}
                    meme={meme}
                    isHot={meme.editorUses >= hotThreshold}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  )
}
