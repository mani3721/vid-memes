import { memo, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Heart, BadgeCheck } from 'lucide-react'
import { compact, timeAgo } from '../data/assets'
import { toMemeUrl } from '../utils/seo'
import ShareButton from './ShareButton'
import { useFavorites } from '../store/FavoritesProvider'
import { useAuth } from '../lib/authContext'
import SignInToFave from './SignInToFave'
import { readGuestPrefs, writeGuestPref } from '../lib/guestSession'

const TORN = ['torn', 'torn-b', 'torn-c']

function MemeCard({ asset, index, aspectClass = 'aspect-square', priority = false }) {
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef(null)

  function handleMouseEnter() {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }
  function handleMouseLeave() {
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 1 }
  }
  const { isFav, toggle } = useFavorites()
  const { user } = useAuth()
  const faved = isFav(asset.id)
  const [showFavePrompt, setShowFavePrompt] = useState(false)

  // The nudge auto-retires so it never becomes noise on a long browse.
  useEffect(() => {
    if (!showFavePrompt) return
    const t = setTimeout(() => setShowFavePrompt(false), 5000)
    return () => clearTimeout(t)
  }, [showFavePrompt])

  const memeUrl = toMemeUrl(asset)
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM'
  const cardAspect = isVideo ? 'aspect-video' : aspectClass

  function handleFaveClick(e) {
    e.preventDefault()
    // Always toggle first. The favorite is saved for guests too (localStorage
    // via useFavorites), so nothing below can block or undo this.
    toggle(asset.id)

    // Guests get a one-time, dismissible note that favorites are browser-local.
    // Only when adding — nagging on removal would be pointless — and never
    // again once dismissed anywhere on the site.
    if (!user && !faved && !readGuestPrefs().dismissed_fave_nudge) {
      setShowFavePrompt(true)
    }
  }

  function dismissFavePrompt() {
    setShowFavePrompt(false)
    writeGuestPref('dismissed_fave_nudge', true)
  }

  return (
    <article className="reveal-card group">
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
            src={asset.publicUrl}
            preload="metadata"
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

        {/*
          Stretched link: the whole thumbnail stays clickable, but as a
          sibling of the action buttons rather than their ancestor.

          It used to wrap them, which made the share menu's destination links
          <a> elements nested inside this <a> — invalid HTML that browsers
          "fix" by silently restructuring the DOM. It also put focusable
          controls inside an aria-hidden subtree, hiding them from screen
          readers. Keeping it flat and underneath (z-0) avoids both.
        */}
        <Link to={memeUrl} tabIndex={-1} aria-hidden className="absolute inset-0 z-0" />

        {/* Hot badge */}
        {asset.isHot && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            🔥 Hot
          </div>
        )}

        {/* Action overlay — above the stretched link so taps reach the buttons */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-1.5 bg-linear-to-t from-black/70 to-transparent p-2.5 pt-8 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
          {/*
            No download button here by design. Downloading happens on the
            asset's own detail page, which the card already links to — a feed
            of download buttons is a page whose primary action bypasses the
            content entirely, and those controls are what AdSlot's
            [data-ad-unsafe] audit refuses to sit beside.
          */}
          <ShareButton
            url={`${window.location.origin}${memeUrl}`}
            title={asset.title}
            size="sm"
            variant="ghost"
          />
        </div>

        {showFavePrompt && <SignInToFave onDismiss={dismissFavePrompt} />}
      </div>

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

      {/* Vidsaur branding row */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <img
          src="/vidsour-logo.webp"
          alt=""
          aria-hidden
          className="size-4 shrink-0 rounded-full opacity-75"
        />
        <span className="text-[11px] text-mid">Vidsaur</span>
        <BadgeCheck className="size-3.5 shrink-0 text-brand" />
      </div>
    </article>
  )
}

// Props are primitives plus a stable `asset` reference from hook state, so shallow
// comparison lets the whole grid skip re-rendering on unrelated parent updates.
export default memo(MemeCard)
