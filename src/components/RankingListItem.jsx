import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye } from 'lucide-react'
import { compact } from '../data/assets'
import { toMemeUrl } from '../utils/seo'

const RANK_COLORS = [
  'text-yellow-400',  // #1 gold
  'text-slate-400',   // #2 silver
  'text-orange-400',  // #3 bronze
]

export default function RankingListItem({ meme, rank }) {
  const memeUrl = toMemeUrl(meme)
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : 'text-lo'
  const isVideo = meme.format === 'MP4' || meme.format === 'WebM'

  return (
    <Link
      to={memeUrl}
      className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-150 hover:bg-panel-hover"
    >
      {/* Rank number */}
      <span
        className={`w-6 shrink-0 text-right font-display text-lg font-bold leading-none ${rankColor}`}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </span>

      {/* Thumbnail — video extracts first frame, image falls back to thumb */}
      {isVideo ? (
        <video
          src={meme.publicUrl}
          preload="metadata"
          muted
          playsInline
          className="size-12 shrink-0 rounded-lg object-cover"
          onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1 }}
        />
      ) : meme.thumb ? (
        <img
          src={meme.thumb}
          alt=""
          loading="lazy"
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        // Fallback when no thumb and not a video
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-panel-hover text-[10px] font-bold uppercase text-lo">
          {meme.format}
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-hi">{meme.title}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-lo">
          <Eye className="size-3 shrink-0" aria-hidden />
          <span>{compact(meme.view_count ?? 0)} views</span>
        </div>
      </div>

      {/* Download count */}
      <div className="flex shrink-0 items-center gap-0.5 text-xs text-lo">
        <Download className="size-3 shrink-0" aria-hidden />
        <span>{compact(meme.editorUses)}</span>
      </div>
    </Link>
  )
}
