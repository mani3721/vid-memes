import { Loader2 } from 'lucide-react'
import MemeCard from './MemeCard'

// Cycle through aspect ratios for the Pinterest-style variable-height effect.
const CARD_ASPECTS = [
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[2/3]',
  'aspect-square',
]

/**
 * Pinterest-style masonry grid.
 *
 * Props:
 *   assets       — array of meme objects (Supabase-normalized or mock)
 *   hasMore      — whether more pages exist (shows Load More button)
 *   onLoadMore   — callback to fetch the next page
 *   loadingMore  — true while the next page is fetching
 */
export default function MasonryFeed({ assets, hasMore, onLoadMore, loadingMore }) {
  return (
    <div>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
        {assets.map((asset, i) => (
          <div key={asset.id} className="mb-3 break-inside-avoid">
            <MemeCard
              asset={asset}
              index={i}
              aspectClass={CARD_ASPECTS[i % CARD_ASPECTS.length]}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-semibold text-hi transition-colors hover:border-volt hover:text-volt disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Loader2 className="size-4" />
            )}
            {loadingMore ? 'Loading…' : 'Show me more'}
          </button>
        </div>
      )}
    </div>
  )
}
