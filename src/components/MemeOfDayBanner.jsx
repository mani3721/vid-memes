import { Sparkles } from 'lucide-react'
import { useTrendingMemes } from '../hooks/useMemes'
import DownloadButton from './DownloadButton'

export default function MemeOfDayBanner() {
  const { memes, loading } = useTrendingMemes({ limit: 1 })
  const meme = memes[0]

  if (loading || !meme) return null

  return (
    <div aria-label="Meme of the day" className="flex items-center gap-3 rounded-2xl border border-edge bg-panel px-3 py-2.5">
      <div className="torn relative size-11 shrink-0 overflow-hidden bg-panel-hover">
        <img src={meme.thumb} alt={meme.title} loading="eager" decoding="async" className="size-full object-cover" />
      </div>

      <span className="hidden shrink-0 items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-hi sm:inline-flex">
        <Sparkles className="size-2.5" strokeWidth={2.5} />
        Today
      </span>

      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-hi">{meme.title}</p>

      <DownloadButton
        label={`Download ${meme.title}`}
        href={meme.publicUrl}
        filename={meme.filename}
        memeId={meme.id}
        size="sm"
      />
    </div>
  )
}
