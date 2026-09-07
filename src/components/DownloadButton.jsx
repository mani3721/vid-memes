import { useEffect, useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import { useStudio } from '../store/studioStore'

/**
 * Download affordance with three states: idle -> filling ring -> checkmark
 * burst. The ring is a pure CSS stroke-dashoffset animation, so the whole
 * interaction stays on the compositor.
 *
 * Downloads are deliberately open to guests — no sign-in gate, no interstitial.
 * Every asset is CC0/Editorial and publicly crawlable, so gating the download
 * would put public content behind a login wall for users and bots alike.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/**
 * @param {string}  href      — R2 public_url for single-file download (optional)
 * @param {string}  filename  — filename hint for the download attribute
 * @param {string}  memeId    — Supabase meme UUID for download tracking (optional)
 * @param {'icon'|'block'} layout
 *        'icon'  — the circular affordance used in card overlays.
 *        'block' — a full-width bar for detail pages. Exists as a real layout
 *                  mode rather than something callers hack in via className,
 *                  because overriding `size-10 rounded-full` from outside
 *                  depends on Tailwind's CSS output order rather than the
 *                  order classes appear in the string, so it silently breaks.
 * @param {string}  text      — visible label in 'block' layout (ignored for 'icon')
 */
export default function DownloadButton({
  label,
  href,
  filename,
  memeId,
  count = 1,
  size = 'md',
  variant = 'solid',
  layout = 'icon',
  text = 'Download',
  className = '',
}) {
  const [state, setState] = useState('idle')
  const { registerDownload } = useStudio()
  const timers = useRef([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const start = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (state !== 'idle') return

    // Trigger actual file download when a CDN URL is provided
    if (href) {
      const a = document.createElement('a')
      a.href = href
      a.download = filename ?? ''
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      // Fire-and-forget download tracking — never block the UX on this
      if (memeId) {
        fetch(`${API_BASE}/api/track-download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memeId }),
        }).catch(() => {})
      }
    }

    setState('working')
    timers.current.push(
      setTimeout(() => {
        setState('done')
        registerDownload(count)
      }, 900),
    )
    timers.current.push(setTimeout(() => setState('idle'), 2300))
  }

  const dims = size === 'sm' ? 'size-8' : 'size-10'
  const tone =
    variant === 'solid'
      ? 'btn-primary'
      : 'bg-black/70 text-white backdrop-blur-sm hover:bg-brand-fill hover:text-ink'

  if (layout === 'block') {
    return (
      <button
        type="button"
        onClick={start}
        // Marks this node for AdSlot's placement audit; do not remove.
        data-ad-unsafe="download"
        aria-label={label}
        // min-h-12 is 48px — Google's minimum touch target. The circular
        // variant is 40px and sits next to another 40px control, which is
        // what made mis-taps easy on a phone. Full width plus a real label
        // means the target is unambiguous.
        className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${tone} ${className}`}
      >
        {state === 'done' ? (
          <>
            <Check className="size-4 shrink-0" strokeWidth={3} />
            Downloaded
          </>
        ) : (
          <>
            <Download className={`size-4 shrink-0 ${state === 'working' ? 'animate-pulse' : ''}`} />
            {text}
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={start}
      // Marks this node for AdSlot's placement audit; do not remove.
      data-ad-unsafe="download"
      aria-label={state === 'done' ? `${label} downloaded` : label}
      className={`group/dl relative grid ${dims} shrink-0 place-items-center rounded-full transition-colors duration-150 ${tone} ${className}`}
    >
      {state === 'working' && (
        <svg viewBox="0 0 32 32" aria-hidden className="absolute inset-0 size-full -rotate-90">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-ring opacity-90"
          />
        </svg>
      )}

      {state === 'done' ? (
        <Check className="animate-burst size-4" strokeWidth={3} />
      ) : (
        <Download className={`size-4 ${state === 'working' ? 'opacity-40' : ''}`} />
      )}
    </button>
  )
}
