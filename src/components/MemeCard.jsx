import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Heart } from 'lucide-react'
import { compact, timeAgo } from '../data/assets'
import { toMemeUrl } from '../utils/seo'
import DownloadButton from './DownloadButton'
import ShareButton from './ShareButton'
import { useFavorites } from '../store/FavoritesProvider'

const TORN = ['torn', 'torn-b', 'torn-c']

export default function MemeCard({ asset, index, aspectClass = 'aspect-square', priority = false }) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority) // priority cards load immediately
  const videoRef = useRef(null)
  const articleRef = useRef(null)

  // Only load video metadata once the card scrolls into view
  useEffect(() => {
    if (!isVideo || inView) return
    const el = articleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleMouseEnter() {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }
  function handleMouseLeave() {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 1 }
  }
  const { isFav, toggle } = useFavorites()
  const faved = isFav(asset.id)

  const memeUrl = toMemeUrl(asset)
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM'
  const cardAspect = isVideo ? 'aspect-video' : aspectClass

  function handleFaveClick(e) {
    e.preventDefault()
    toggle(asset.id)
  }

  return (
    <article ref={articleRef} className="reveal-card group">
      <Link to={memeUrl} tabIndex={-1} aria-hidden className="block">
        {/* Thumbnail */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={[
            TORN[index % 3],
            'paper-lift group-hover:paper-lift-hover',
            'relative overflow-hidden',
            cardAspect,
            'bg-panel border border-edge',
            'transition-[border-color] duration-200 group-hover:border-brand/50',
          ].join(' ')}
        >
          {/* Shimmer skeleton */}
          <div
            aria-hidden
            className={`absolute inset-0 bg-panel-hover ${loaded ? 'opacity-0' : 'animate-shimmer'}`}
          />

          {isVideo ? (
            <video
              ref={videoRef}
              src={inView ? asset.publicUrl : undefined}
              preload={inView ? 'metadata' : 'none'}
              muted
              loop
              playsInline
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; setLoaded(true) }}
              onError={() => setLoaded(true)}
              className={`size-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <img
              src={asset.thumb}
              alt={`${asset.title} meme ${asset.format} download`}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              {...(priority ? { fetchpriority: 'high' } : {})}
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
              className={`size-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Hot badge */}
          {asset.isHot && (
            <div className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              🔥 Hot
            </div>
          )}

          {/* Action overlay */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-linear-to-t from-black/70 to-transparent p-2.5 pt-8 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={handleFaveClick}
              aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
              className={`grid size-7 place-items-center rounded-full backdrop-blur-sm transition-colors duration-150 ${
                faved ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500'
              }`}
            >
              <Heart className={`size-3.5 ${faved ? 'fill-current' : ''}`} />
            </button>
            <ShareButton
              url={`${window.location.origin}${memeUrl}`}
              title={asset.title}
              size="sm"
              variant="ghost"
            />
            <DownloadButton
              label={`Download ${asset.title} ${asset.format}`}
              href={asset.publicUrl}
              filename={asset.filename}
              memeId={asset.id}
              size="sm"
              variant="ghost"
            />
          </div>

        </div>
      </Link>

      {/* Format badge + title */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <Link
          to={memeUrl}
          className="flex-1 line-clamp-1 text-sm font-medium text-hi transition-colors hover:text-brand"
        >
          {asset.title}
        </Link>
        <span className="shrink-0 rounded-md bg-panel-hover px-1.5 py-0.5 text-[10px] font-medium text-mid">
          {asset.format}
        </span>
      </div>

      {/* Download count + upload time */}
      <p className="mt-0.5 flex items-center gap-1 text-xs text-lo">
        <Download className="size-3 shrink-0" />
        {compact(asset.editorUses)} downloads
        {timeAgo(asset.createdAt) && (
          <>
            <span className="mx-0.5 opacity-30">·</span>
            {timeAgo(asset.createdAt)}
          </>
        )}
      </p>
    </article>
  )
}
