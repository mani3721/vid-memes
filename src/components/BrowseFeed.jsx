import { AlertCircle, Loader2 } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import { useCategoryMemes } from '../hooks/useMemes'
import { WEBSITE_SCHEMA } from '../utils/seo'
import SEO from './SEO'
import MasonryFeed from './MasonryFeed'
import TodayRankingWidget from './TodayRankingWidget'
import PageHeading from './PageHeading'
import FeedToggle from './FeedToggle'

export default function BrowseFeed() {
  const { mood, query } = useStudio()

  // Filtering is done server-side via Supabase — mood and query are sent as
  // query params, so the hook re-fetches automatically when they change.
  const { memes, loading, loadingMore, error, hasMore, loadMore } = useCategoryMemes({
    mood: mood ?? undefined,
    query: query || undefined,
    excludeCategory: ['sounds', 'images', 'gifs'],
  })

  return (
    <>
      <SEO
        title="Memes Download: Free Meme Videos, GIFs &amp; Templates"
        description="Download free meme videos, GIFs, blank templates, and sound effects. No watermark, HD quality, updated daily. Perfect for creators, Reels, Shorts, and WhatsApp Status."
        keywords="meme download, meme video download, free meme download, meme templates, meme sound effects, no watermark memes, funny memes download, gif memes download"
        canonicalPath="/"
        schemas={[WEBSITE_SCHEMA]}
      />

      <div className="flex flex-col gap-5">
        {/* Browse / Trending toggle */}
        <FeedToggle />

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
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="feed-heading" className="font-display text-lg tracking-wide text-hi">
              🔥 FRESH OFF THE INTERNET
            </h2>
            {!loading && (
              <span className="text-xs text-lo">
                {memes.length}{hasMore ? '+' : ''} memes
              </span>
            )}
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
              hasMore={hasMore}
              onLoadMore={loadMore}
              loadingMore={loadingMore}
            />
          )}
        </section>

        {/* SEO content block */}
        <section aria-labelledby="about-videsaur" className="mt-8 border-t border-edge pt-8">
          <h2 id="about-videsaur" className="mb-5 font-display text-lg tracking-wide text-hi">
            About Videsaur
          </h2>
          <div className="grid gap-6 text-sm leading-relaxed text-mid sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold text-hi">What is Videsaur?</h3>
              <p>
                Videsaur is a free meme download hub for content creators, social media managers,
                and meme enthusiasts. Browse thousands of HD meme videos, animated GIFs, blank
                templates, and sound effects — all without watermarks, accounts, or fees.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-hi">How to Download</h3>
              <p>
                Find a meme you love, click the card to open its detail page, then tap the
                Download button. Every file is served in its native format — MP4, WebM, GIF, PNG,
                or MP3 — at full resolution, ready for Instagram Reels, YouTube Shorts, WhatsApp
                Status, TikTok, Discord, and any video editor.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-hi">Why Videsaur?</h3>
              <ul className="space-y-1.5">
                <li><strong className="text-hi">Updated daily</strong> — fresh memes every day.</li>
                <li><strong className="text-hi">HD quality</strong> — optimised for every platform.</li>
                <li><strong className="text-hi">No watermark</strong> — clean, ready-to-use files.</li>
                <li><strong className="text-hi">Free forever</strong> — no subscription, no gotchas.</li>
                <li><strong className="text-hi">Creator tools</strong> — bulk downloads, green-screen assets, and sound effects.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
