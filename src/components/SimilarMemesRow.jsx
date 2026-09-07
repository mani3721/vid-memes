import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { compact, timeAgo } from '../data/assets'
import { toMemeUrl } from '../utils/seo'
import SoundCard from './SoundCard'

function SimilarVideoCard({ asset }) {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef(null)
  const memeUrl = toMemeUrl(asset)
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM'

  function handleMouseEnter() {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }
  function handleMouseLeave() {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0 }
  }

  return (
    <article className="group w-44 shrink-0 sm:w-52">
      <Link to={memeUrl} tabIndex={-1} aria-hidden className="block">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden rounded-xl border border-edge bg-panel aspect-video transition-colors group-hover:border-brand/40"
        >
          {/* Shimmer */}
          <div
            aria-hidden
            className={`absolute inset-0 bg-panel-hover ${loaded ? 'opacity-0' : 'animate-shimmer'}`}
          />

          {isVideo ? (
            <video
              ref={videoRef}
              src={asset.publicUrl}
              preload="metadata"
              muted
              loop
              playsInline
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 0; setLoaded(true) }}
              onError={() => setLoaded(true)}
              className={`size-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <img
              src={asset.thumb}
              alt={`${asset.title} meme`}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(true)}
              className={`size-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/*
            The hover overlay here held a single download button and nothing
            else, so it is gone rather than left as an empty gradient. The
            card links to the asset's detail page, which is where downloading
            now happens.

            This row renders inside MemePage, directly alongside <AdSlot> —
            AdSlot's audit refuses to render next to a [data-ad-unsafe]
            control, so these buttons were also suppressing the ad they sat
            beside.
          */}

          {/* Format badge */}
          <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {asset.format}
          </span>
        </div>
      </Link>

      <Link to={memeUrl} className="mt-2 block">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-hi transition-colors hover:text-brand">
          {asset.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-lo">
          <Download className="size-2.5 shrink-0" />
          {compact(asset.editorUses)}
          {timeAgo(asset.createdAt) && <> · {timeAgo(asset.createdAt)}</>}
        </p>
      </Link>
    </article>
  )
}

export default function SimilarMemesRow({ memes, loading }) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-44 shrink-0 sm:w-52">
            <div className="aspect-video animate-shimmer rounded-xl bg-panel-hover" />
            <div className="mt-2 h-3 w-3/4 animate-shimmer rounded bg-panel-hover" />
            <div className="mt-1.5 h-2.5 w-1/2 animate-shimmer rounded bg-panel-hover" />
          </div>
        ))}
      </div>
    )
  }

  if (!memes.length) return null

  const sounds = memes.filter((a) => a.category === 'sounds')
  const visual = memes.filter((a) => a.category !== 'sounds')

  return (
    <div className="space-y-4">
      {/* Visual memes — horizontal scroll row */}
      {visual.length > 0 && (
        <div className="-mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-hide sm:-mx-6 sm:px-6">
          {visual.map((asset) => (
            <SimilarVideoCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Sound effects — vertical compact cards */}
      {sounds.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {sounds.map((sfx) => (
            <SoundCard key={sfx.id} sfx={sfx} />
          ))}
        </div>
      )}
    </div>
  )
}
