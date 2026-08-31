import { Share2, Sparkles } from 'lucide-react'
import { compact } from '../data/assets'
import { useTrendingMemes } from '../hooks/useMemes'
import DownloadButton from './DownloadButton'

export default function MemeOfTheDay() {
  const { memes, loading } = useTrendingMemes({ limit: 1 })
  const meme = memes[0]

  if (loading || !meme) return null

  return (
    <section aria-labelledby="motd-heading" className="overflow-hidden rounded-3xl bg-cream text-ink">
      <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-center md:gap-8">
        <div className="torn paper-lift relative aspect-square w-full shrink-0 overflow-hidden bg-cream-2 md:w-64 lg:w-72">
          <img src={meme.thumb} alt={meme.title} loading="eager" decoding="async" className="size-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-hi">
            <Sparkles className="size-3" strokeWidth={2.5} />
            Meme of the day
          </span>

          <h2 id="motd-heading" className="mt-3 font-display text-3xl leading-[0.95] tracking-wide text-ink sm:text-4xl lg:text-5xl">
            {meme.title.toUpperCase()}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
            <span>😂 {compact(meme.reactions.laugh)}</span>
            <span>🔥 {compact(meme.reactions.fire)}</span>
            <span>💀 {compact(meme.reactions.skull)}</span>
            <span className="text-ink-soft/70">{compact(meme.editorUses)} downloads</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <DownloadButton
              label={`Download ${meme.title}`}
              href={meme.publicUrl}
              filename={meme.filename}
              memeId={meme.id}
              className="shadow-sm"
            />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-line-c px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-cream-2"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
