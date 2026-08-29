import { compact } from '../data/assets'
import { useTrendingMemes } from '../hooks/useMemes'

const MEDAL = ['text-yellow-400', 'text-slate-300', 'text-amber-600']

export default function TodayRankingWidget({ variant = 'sidebar' }) {
  const { memes: top10, loading } = useTrendingMemes({ limit: 10 })

  if (loading || top10.length === 0) return null

  if (variant === 'strip') {
    return (
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {top10.map((asset, i) => (
          <a
            key={asset.id}
            href={`/meme/${asset.id}`}
            className="flex w-[6.5rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border border-edge bg-panel px-2 py-2.5 text-center transition-colors duration-150 hover:border-volt/50"
          >
            <div className="relative">
              <img src={asset.thumb} alt={asset.title} className="size-10 rounded-lg object-cover" />
              <span className={`absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-full bg-canvas text-[10px] font-bold tabular-nums ${i < 3 ? MEDAL[i] : 'text-mid'}`}>
                {i + 1}
              </span>
            </div>
            <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-hi">{asset.title}</p>
          </a>
        ))}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 font-display text-[11px] tracking-widest text-mid">🔥 TODAY&rsquo;S TOP RANKING</p>
      <ol className="space-y-0.5">
        {top10.map((asset, i) => (
          <li key={asset.id}>
            <a
              href={`/meme/${asset.id}`}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors duration-150 hover:bg-panel-hover"
            >
              <span className={`w-5 shrink-0 text-center text-xs font-bold tabular-nums ${i < 3 ? MEDAL[i] : 'text-mid'}`}>
                {i + 1}
              </span>
              <img src={asset.thumb} alt="" aria-hidden className="size-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-snug text-hi">{asset.title}</p>
                <p className="text-[11px] tabular-nums text-mid">{compact(asset.editorUses)} downloads</p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
