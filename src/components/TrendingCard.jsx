import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toMemeUrl } from '../utils/seo'

export default function TrendingCard({ meme, isHot = false }) {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef(null)
  const memeUrl = toMemeUrl(meme)
  const isVideo = meme.format === 'MP4' || meme.format === 'WebM'

  function handleMouseEnter() {
    videoRef.current?.play().catch(() => {})
  }

  function handleMouseLeave() {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = 0
  }

  return (
    <Link
      to={memeUrl}
      onMouseEnter={isVideo ? handleMouseEnter : undefined}
      onMouseLeave={isVideo ? handleMouseLeave : undefined}
      className="group block overflow-hidden rounded-2xl border border-edge bg-panel transition-all duration-200 hover:border-brand/40 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/40"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video overflow-hidden bg-panel-hover">
        {/* Shimmer skeleton */}
        <div
          aria-hidden
          className={`absolute inset-0 bg-panel-hover transition-opacity duration-200 ${loaded ? 'opacity-0' : 'animate-shimmer'}`}
        />

        {isVideo ? (
          <video
            ref={videoRef}
            src={meme.publicUrl}
            preload="metadata"
            muted
            playsInline
            loop
            onLoadedMetadata={(e) => {
              // Seek to 1 s so the poster frame isn't a black first frame
              e.currentTarget.currentTime = 1
              setLoaded(true)
            }}
            onError={() => setLoaded(true)}
            className={`size-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <img
            src={meme.thumb}
            alt={`${meme.title} thumbnail`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            className={`size-full object-cover transition-[transform,opacity] duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Hover play hint — only for video cards */}
        {isVideo && loaded && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="grid size-10 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="white" className="size-5 translate-x-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Badges — top-left */}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          {isHot && (
            <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-ink shadow-sm">
              🔥 Hot
            </span>
          )}
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {meme.format}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="line-clamp-1 font-semibold text-hi">{meme.title}</p>
        <p className="mt-0.5 text-xs capitalize text-lo">{meme.category}</p>
      </div>
    </Link>
  )
}
