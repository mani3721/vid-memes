import { useMemo } from 'react'
import { AudioLines } from 'lucide-react'
import { waveformBars } from '../utils/audioPreview'

/**
 * Small preview image for an asset, in lists and rankings.
 *
 * Does NOT simply render asset.thumb, because that column is currently
 * unreliable: generateThumbnail() in server/routes/upload.js only produces a
 * real frame when ffmpeg is available, and ffmpeg was missing from the
 * server's dependencies, so its `catch` quietly wrote a flat rgb(18,16,28)
 * square instead. Every existing row therefore has a valid, 722-byte, totally
 * blank WebP — it loads with HTTP 200 and shows nothing, which is why feeds
 * looked fine (MemeCard renders a <video>, bypassing the column) while
 * thumbnail-based lists rendered as empty rectangles.
 *
 * So each media kind is drawn from something that is definitely present:
 *   video → a frame from the video file itself, as MemeCard already does
 *   audio → waveform art generated from the id, as AudioHero already does
 *   image → the stored thumbnail, which is correct for images
 *
 * Once the thumbnails are backfilled (see server/scripts/backfill-thumbnails.mjs)
 * the video branch can become a plain <img> for less network work.
 */
export default function AssetThumb({ asset, className = '' }) {
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM'
  const isAudio = asset.format === 'MP3' || asset.format === 'WAV'
  const bars = useMemo(() => (isAudio ? waveformBars(asset.id, 14) : []), [isAudio, asset.id])

  const base = `shrink-0 overflow-hidden rounded-lg border border-edge bg-panel-hover ${className}`

  if (isAudio) {
    return (
      <span aria-hidden className={`${base} relative grid place-items-center`}>
        <span className="absolute inset-0 bg-brand-gradient opacity-20" />
        <span className="relative flex h-1/2 items-end gap-[2px]">
          {bars.map((h, i) => (
            <span key={i} className="w-[2px] rounded-full bg-brand/80" style={{ height: `${h}%` }} />
          ))}
        </span>
        {bars.length === 0 && <AudioLines className="relative size-4 text-brand" />}
      </span>
    )
  }

  if (isVideo) {
    return (
      <span className={base}>
        <video
          src={asset.publicUrl}
          // metadata only: enough for the browser to decode a frame without
          // pulling the whole clip for a 100px-wide preview.
          preload="metadata"
          muted
          playsInline
          aria-hidden
          // Seek a second in — frame zero is often black or a fade.
          onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1 }}
          className="size-full object-cover"
        />
      </span>
    )
  }

  return (
    <span className={base}>
      <img
        src={asset.thumb}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </span>
  )
}
