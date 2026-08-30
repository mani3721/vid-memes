import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import MemeCard from './MemeCard'

// Wide landscape mix: 16/9 and square alternating
const CARD_ASPECTS = [
  'aspect-video',
  'aspect-square',
  'aspect-video',
  'aspect-video',
  'aspect-square',
]

export default function MasonryFeed({ assets, hasMore, onLoadMore, loadingMore }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  return (
    <div>
      <div className="columns-2 gap-3 sm:columns-4 xl:columns-6">
        {assets.map((asset, i) => (
          <div
            key={asset.id}
            className="reveal-item mb-3 break-inside-avoid"
            style={{ '--stagger': i % 4 }}
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

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-8" aria-hidden="true">
        {loadingMore && <Loader2 className="size-6 animate-spin text-brand" />}
      </div>
    </div>
  )
}
