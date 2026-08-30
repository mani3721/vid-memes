import { useEffect, useRef, useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

const CAN_NATIVE_SHARE = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

const PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp',   emoji: '💬', href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: 'twitter',  label: 'X (Twitter)', emoji: '🐦', href: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
  { id: 'telegram', label: 'Telegram',   emoji: '✈️',  href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
]

/**
 * Props:
 *   url      – full share URL
 *   title    – meme title (used in share text)
 *   size     – 'sm' (card overlay) | 'md' (detail page)
 *   variant  – 'ghost' (dark glass, for cards) | 'solid' (panel bg, for detail)
 */
export default function ShareButton({ url, title, size = 'md', variant = 'ghost', className = '' }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const shareText = `${title} — free meme download 🦕`

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (CAN_NATIVE_SHARE) {
      try {
        await navigator.share({ title, text: shareText, url })
      } catch (err) {
        if (err.name !== 'AbortError') copyLink()
      }
    } else {
      setOpen((v) => !v)
    }
  }

  async function copyLink(e) {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setOpen(false)
    setTimeout(() => setCopied(false), 2200)
  }

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const dims = size === 'sm' ? 'size-7' : 'size-10'
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'
  const tone =
    variant === 'ghost'
      ? 'bg-black/50 text-white backdrop-blur-sm hover:bg-brand'
      : 'bg-panel-hover text-mid hover:bg-brand hover:text-white'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={copied ? 'Link copied!' : 'Share this meme'}
        aria-expanded={open}
        className={`grid ${dims} shrink-0 place-items-center rounded-full transition-colors duration-150 ${tone} ${copied ? '!bg-brand !text-white' : ''}`}
      >
        {copied
          ? <Check className={`${iconSize} animate-burst`} strokeWidth={3} />
          : <Share2 className={iconSize} />}
      </button>

      {/* Desktop fallback popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Share options"
          className="absolute bottom-full right-0 z-50 mb-2 min-w-44 overflow-hidden rounded-2xl border border-edge bg-panel shadow-xl animate-rise"
        >
          {/* Copy link */}
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-hi transition-colors hover:bg-panel-hover"
          >
            <Link2 className="size-4 text-mid" />
            Copy link
          </button>

          <div className="mx-4 border-t border-edge" />

          {/* Platform links */}
          {PLATFORMS.map(({ id, label, emoji, href }) => (
            <a
              key={id}
              href={href(url, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-hi transition-colors hover:bg-panel-hover"
            >
              <span className="w-4 text-center text-base leading-none">{emoji}</span>
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
