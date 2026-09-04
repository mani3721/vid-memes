import MemeCard from './MemeCard'

// Stable style objects — `i % 4` only ever yields 0-3, so hoisting these keeps the
// wrapper style referentially equal across re-renders instead of allocating per card.
const STAGGER = [
  { '--stagger': 0 },
  { '--stagger': 1 },
  { '--stagger': 2 },
  { '--stagger': 3 },
]

const CARD_ASPECTS = [
  'aspect-video',
  'aspect-square',
  'aspect-video',
  'aspect-video',
  'aspect-square',
]

export default function MasonryFeed({ assets, page, totalPages, onPageChange }) {
  function handlePageChange(next) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onPageChange?.(next)
  }

  return (
    <div>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {assets.map((asset, i) => (
          <div
            key={asset.id}
            className="reveal-item mb-4 break-inside-avoid"
            style={STAGGER[i % 4]}
          >
            <MemeCard
              asset={asset}
              index={i}
              aspectClass={CARD_ASPECTS[i % CARD_ASPECTS.length]}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="rounded-full border border-edge bg-transparent px-4 py-2 text-sm text-mid transition-colors duration-150 hover:bg-panel-hover hover:text-hi active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-lo">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="rounded-full border border-brand bg-transparent px-4 py-2 text-sm text-brand transition-colors duration-150 hover:bg-brand/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
