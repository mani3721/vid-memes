import { useEffect, useRef, useState } from 'react'
import { Check, Download, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStudio } from '../store/studioStore'
import { useAuth } from '../lib/authContext'

/**
 * Download affordance with three states: idle -> filling ring -> checkmark
 * burst. The ring is a pure CSS stroke-dashoffset animation, so the whole
 * interaction stays on the compositor.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/**
 * @param {string}  href      — R2 public_url for single-file download (optional)
 * @param {string}  filename  — filename hint for the download attribute
 * @param {string}  memeId    — Supabase meme UUID for download tracking (optional)
 */
export default function DownloadButton({
  label,
  href,
  filename,
  memeId,
  count = 1,
  size = 'md',
  variant = 'solid',
  className = '',
}) {
  const [state, setState] = useState('idle')
  const { registerDownload } = useStudio()
  const { user } = useAuth()
  const navigate = useNavigate()
  const timers = useRef([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const start = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (state !== 'idle') return

    // Require sign-in to download
    if (!user) {
      navigate('/login')
      return
    }

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
      ? 'bg-brand text-ink hover:bg-brand-2'
      : 'bg-black/70 text-white backdrop-blur-sm hover:bg-brand hover:text-ink'

  // Guest-mode: muted style with lock hint
  const guestTone = variant === 'solid'
    ? 'bg-panel-hover text-mid hover:bg-brand hover:text-ink'
    : 'bg-black/70 text-mid/60 backdrop-blur-sm hover:bg-brand hover:text-ink'

  return (
    <button
      type="button"
      onClick={start}
      // Marks this node for AdSlot's placement audit; do not remove.
      data-ad-unsafe="download"
      title={!user ? 'Sign in to download' : undefined}
      aria-label={!user ? 'Sign in to download' : state === 'done' ? `${label} downloaded` : label}
      className={`group/dl relative grid ${dims} shrink-0 place-items-center rounded-full transition-colors duration-150 ${user ? tone : guestTone} ${className}`}
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
      ) : !user ? (
        <>
          <Download className="size-4 group-hover/dl:hidden" />
          <Lock className="hidden size-4 group-hover/dl:block" />
        </>
      ) : (
        <Download className={`size-4 ${state === 'working' ? 'opacity-40' : ''}`} />
      )}
    </button>
  )
}
