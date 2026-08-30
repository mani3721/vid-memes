import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { compact } from '../data/assets'
import { useTodayTrending } from '../hooks/useMemes'
import { toMemeUrl } from '../utils/seo'

const MEDAL = ['text-yellow-400', 'text-slate-300', 'text-amber-600']

// Seconds until next midnight UTC
function secsToMidnight() {
  const now = new Date()
  const midnight = new Date()
  midnight.setUTCHours(24, 0, 0, 0)
  return Math.max(0, Math.floor((midnight - now) / 1000))
}

function useCountdown() {
  const [secs, setSecs] = useState(secsToMidnight)
  useEffect(() => {
    const t = setInterval(() => setSecs(secsToMidnight()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function TodayRankingWidget({ variant = 'sidebar' }) {
  const { memes: top10, loading, lastUpdated, isFallback } = useTodayTrending({ limit: 10 })
  const countdown = useCountdown()

  if (loading && top10.length === 0) {
    return (
      <div className="space-y-2 py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="size-5 shrink-0 animate-shimmer rounded bg-panel-hover" />
            <div className="size-10 shrink-0 animate-shimmer rounded-lg bg-panel-hover" />
            <div className="flex-1 space-y-1">
              <div className="h-2.5 w-3/4 animate-shimmer rounded bg-panel-hover" />
              <div className="h-2 w-1/2 animate-shimmer rounded bg-panel-hover" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (top10.length === 0) return null

  /* ── Horizontal strip (mobile home) ──────────────────────────── */
  if (variant === 'strip') {
    return (
      <div className="space-y-2">
        <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {top10.map((asset, i) => (
            <Link
              key={asset.id}
              to={toMemeUrl(asset)}
              className="flex w-26 shrink-0 flex-col items-center gap-1.5 rounded-xl border border-edge bg-panel px-2 py-2.5 text-center transition-colors hover:border-brand/50"
            >
              <div className="relative">
                <img src={asset.thumb} alt={asset.title} className="size-10 rounded-lg object-cover" />
                <span className={`absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-full bg-canvas text-[10px] font-bold tabular-nums ${i < 3 ? MEDAL[i] : 'text-mid'}`}>
                  {i + 1}
                </span>
              </div>
              <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-hi">{asset.title}</p>
              {!isFallback && asset.todayDownloads != null && (
                <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-semibold text-brand">
                  🔥 {asset.todayDownloads} today
                </span>
              )}
            </Link>
          ))}
        </div>
        <p className="text-[10px] text-lo/60 tabular-nums">
          {isFallback ? 'All-time ranking' : `Resets in ${countdown}`}
          {lastUpdated && (
            <span className="ml-2 opacity-60">
              · updated {Math.round((Date.now() - lastUpdated) / 60000) || '<1'}m ago
            </span>
          )}
        </p>
      </div>
    )
  }

  /* ── Sidebar list (desktop) ───────────────────────────────────── */
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-display text-[11px] tracking-widest text-mid">
          🔥 TODAY&rsquo;S TOP RANKING
        </p>
        {loading && <RefreshCw className="size-3 animate-spin text-lo" />}
      </div>

      <ol className="space-y-0.5">
        {top10.map((asset, i) => (
          <li key={asset.id}>
            <Link
              to={toMemeUrl(asset)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-panel-hover"
            >
              <span className={`w-5 shrink-0 text-center text-xs font-bold tabular-nums ${i < 3 ? MEDAL[i] : 'text-mid'}`}>
                {i + 1}
              </span>
              <img src={asset.thumb} alt="" aria-hidden className="size-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-snug text-hi">{asset.title}</p>
                {!isFallback && asset.todayDownloads != null ? (
                  <p className="text-[11px] font-semibold tabular-nums text-brand">
                    🔥 {asset.todayDownloads} today
                  </p>
                ) : (
                  <p className="text-[11px] tabular-nums text-mid">{compact(asset.editorUses)} downloads</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>

      {/* Footer: countdown + last updated */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-lo/70 tabular-nums">
        <span>
          {isFallback ? 'All-time ranking' : <>Resets in <span className="font-medium text-lo">{countdown}</span></>}
        </span>
        {lastUpdated && (
          <span>
            {Math.round((Date.now() - lastUpdated) / 60000) || '<1'}m ago
          </span>
        )}
      </div>
    </div>
  )
}
