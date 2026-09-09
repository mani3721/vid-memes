import { memo, useEffect, useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import ShareButton from './ShareButton'
import { registerStickerShare } from '../hooks/useStickers'

/**
 * Saves a cross-origin sticker to disk.
 *
 * The shared DownloadButton builds an `<a download>` and clicks it, which only
 * works same-origin — for a static.klipy.com URL the browser ignores the
 * `download` attribute and navigates to the image instead, dumping the user
 * out of the grid. Fetching to a Blob and handing over an object URL keeps the
 * save on-page. That blob is a transient copy for the visitor's own device; it
 * is never stored or re-served, which is what KLIPY's no-re-hosting term is
 * about.
 *
 * If KLIPY's CDN ever refuses the cross-origin read, opening the URL in a new
 * tab still lets the user save it manually — a degraded save beats a dead
 * button.
 */
async function saveSticker(url, filename) {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) throw new Error(String(res.status))
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Revoked on a delay: revoking synchronously can cancel the save in Safari.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * One KLIPY sticker.
 *
 * `object-contain` rather than `object-cover`: stickers are die-cut artwork of
 * every aspect ratio, and cropping one is cropping the subject's head off.
 * The checkerboard fills whatever space that leaves.
 */
function StickerCard({ sticker, searchTerm = '', priority = false }) {
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleDownload(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!sticker.downloadUrl) return

    const ext = sticker.downloadFormat ?? 'png'
    await saveSticker(sticker.downloadUrl, `${sticker.slug || 'sticker'}.${ext}`)

    setSaved(true)
    timer.current = setTimeout(() => setSaved(false), 2000)
  }

  return (
    <figure className="group flex flex-col gap-1.5">
      <div
        className={[
          'checker-surface relative overflow-hidden rounded-xl border border-edge',
          'aspect-square transition-colors duration-200 group-hover:border-brand/50',
          'focus-within:border-brand/50',
        ].join(' ')}
      >
        {/*
          KLIPY ships a base64 blur thumbnail with every item, so the slot is
          filled with the sticker's own colours instead of a grey shimmer.
          Falls back to the shimmer when an item has none.
        */}
        {!loaded && (
          sticker.blurPreview ? (
            <img
              src={sticker.blurPreview}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-110 object-contain blur-lg"
            />
          ) : (
            <div aria-hidden className="absolute inset-0 animate-shimmer bg-panel-hover" />
          )
        )}

        <img
          src={sticker.previewUrl}
          alt={sticker.title}
          width={sticker.width ?? undefined}
          height={sticker.height ?? undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...(priority ? { fetchPriority: 'high' } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`relative size-full object-contain p-2 transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/*
          Actions stay visible on touch (no hover to reveal them) and fade in
          on pointer devices. The scrim is anchored to the bottom edge so it
          never sits over the middle of the artwork.
        */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-1.5 bg-linear-to-t from-black/70 to-transparent p-2 pt-8 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!sticker.downloadUrl}
            aria-label={saved ? 'Sticker downloaded' : `Download ${sticker.title}`}
            className={`grid size-7 shrink-0 place-items-center rounded-full backdrop-blur-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
              saved ? 'bg-brand-fill text-ink' : 'bg-black/50 text-white hover:bg-brand-fill hover:text-ink'
            }`}
          >
            {saved
              ? <Check className="size-3.5 animate-burst" strokeWidth={3} />
              : <Download className="size-3.5" />}
          </button>

          {/*
            Shares the KLIPY media URL untouched, as their terms require, and
            pings their share endpoint so the sticker's own trending signal
            still counts.
          */}
          <ShareButton
            url={sticker.downloadUrl ?? sticker.previewUrl}
            title={sticker.title}
            noun="sticker"
            shareText={`${sticker.title} 🦕`}
            onShare={() => registerStickerShare(sticker.slug, searchTerm)}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>

      <figcaption className="line-clamp-1 px-0.5 text-center text-[11px] text-lo" title={sticker.title}>
        {sticker.title}
      </figcaption>
    </figure>
  )
}

// The `sticker` object is a stable reference out of the hook's state, so a
// shallow compare lets a 24-card grid skip re-rendering while the user types.
export default memo(StickerCard)
