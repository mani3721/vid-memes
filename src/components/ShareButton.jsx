import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Share2, Link2, Check, MessageCircle, Send, Mail } from 'lucide-react'

const CAN_NATIVE_SHARE = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

/**
 * Brand marks are drawn as a coloured chip with a letterform or a generic
 * glyph rather than the real logos: lucide dropped brand icons for trademark
 * reasons, and hand-inlining logo paths means shipping artwork that silently
 * renders as a blob if a single path command is wrong. Colour plus the text
 * label beside it already identifies each destination unambiguously.
 */
const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    chip: 'bg-[#25D366] text-white',
    Icon: MessageCircle,
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    chip: 'bg-[#229ED9] text-white',
    Icon: Send,
    href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: 'x',
    label: 'X',
    // Pure black vanishes against the dark panel, so this one carries a ring.
    chip: 'bg-black text-white ring-1 ring-inset ring-white/25',
    glyph: '𝕏',
    href: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    chip: 'bg-[#1877F2] text-white',
    glyph: 'f',
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    chip: 'bg-[#FF4500] text-white',
    glyph: 'r',
    href: (u, t) => `https://www.reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    id: 'email',
    label: 'Email',
    chip: 'bg-panel-hover text-mid',
    Icon: Mail,
    href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${t}\n\n${u}`)}`,
  },
]

const MENU_W = 232
const EDGE = 8

/**
 * Place the menu in viewport coordinates.
 *
 * The menu is portalled to <body> and positioned fixed rather than rendered
 * next to the trigger. In a feed card the trigger lives inside a
 * `relative overflow-hidden` thumbnail, which would clip an absolutely
 * positioned menu — with six destinations there is more menu than card.
 */
function computePosition(rect) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const left = Math.max(EDGE, Math.min(rect.right - MENU_W, vw - MENU_W - EDGE))

  const spaceAbove = rect.top
  const spaceBelow = vh - rect.bottom
  const above = spaceAbove > spaceBelow

  return {
    left,
    // Anchor to whichever edge has room, and cap the height to that space so
    // a short viewport scrolls the list instead of overflowing off-screen.
    ...(above
      ? { bottom: vh - rect.top + EDGE, maxHeight: spaceAbove - EDGE * 2 }
      : { top: rect.bottom + EDGE, maxHeight: spaceBelow - EDGE * 2 }),
  }
}

/**
 * Props:
 *   url      – full share URL
 *   title    – meme title (used in share text)
 *   size     – 'sm' (card overlay) | 'md' (detail page)
 *   variant  – 'ghost' (dark glass, for cards) | 'solid' (panel bg, for detail)
 *   layout   – 'icon' (circular, for card overlays) | 'block' (full-width bar,
 *              for detail pages). Same reasoning as DownloadButton: a real
 *              layout mode, not a className override, because beating
 *              `size-10 rounded-full` from outside depends on Tailwind's
 *              output order rather than class order.
 *   text     – visible label in 'block' layout
 *   noun     – what is being shared, for the button's accessible name. Only
 *              the label changes; the meme copy below is still the default.
 *   shareText– overrides the message body (stickers are not "meme downloads")
 *   onShare  – fired once per completed share action (copy, platform, native
 *              sheet). Used to register the share with the content's source
 *              provider; must never block or alter the share itself.
 */
export default function ShareButton({
  url,
  title,
  size = 'md',
  variant = 'ghost',
  layout = 'icon',
  text = 'Share',
  noun = 'meme',
  shareText: shareTextProp,
  onShare,
  className = '',
}) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const shareText = shareTextProp ?? `${title} — free meme download 🦕`

  const reposition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setPos(computePosition(rect))
  }, [])

  // Measure before paint so the menu never flashes at the wrong spot.
  useLayoutEffect(() => {
    if (open) reposition()
  }, [open, reposition])

  function toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    setOpen((v) => !v)
  }

  const copyLink = useCallback(async (e) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API needs a secure context and permission; fall back to the
      // legacy selection trick so copy still works on http:// and old Safari.
      const el = document.createElement('textarea')
      el.value = url
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      try { document.execCommand('copy') } catch { /* nothing else to try */ }
      document.body.removeChild(el)
    }
    setCopied(true)
    setOpen(false)
    onShare?.()
    setTimeout(() => setCopied(false), 2200)
  }, [url, onShare])

  async function nativeShare(e) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
    try {
      await navigator.share({ title, text: shareText, url })
      onShare?.()
    } catch (err) {
      // A user cancelling the sheet is not a failure — only fall back on a
      // real error.
      if (err?.name !== 'AbortError') copyLink()
    }
  }

  // Dismiss on outside click, Escape, scroll or resize. Scroll and resize
  // close rather than re-track: the trigger can scroll out from under a fixed
  // menu, leaving it stranded mid-viewport.
  useEffect(() => {
    if (!open) return

    function onDown(e) {
      if (menuRef.current?.contains(e.target)) return
      if (buttonRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() }
    }
    const close = () => setOpen(false)

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
    // capture:true so it also fires for scrolls inside nested containers
    window.addEventListener('scroll', close, true)

    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  const dims = size === 'sm' ? 'size-7' : 'size-10'
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'
  const tone =
    variant === 'ghost'
      ? 'bg-black/50 text-white backdrop-blur-sm hover:bg-brand-fill hover:text-ink'
      : 'bg-panel-hover text-mid hover:bg-brand-fill hover:text-ink'

  const rowClass =
    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-hi transition-colors hover:bg-panel-hover'

  return (
    <>
      {layout === 'block' ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={copied ? 'Link copied' : `Share this ${noun}`}
          aria-haspopup="menu"
          aria-expanded={open}
          // min-h-12 (48px) matches DownloadButton's block layout so the two
          // stack as an even pair.
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-edge bg-panel-hover px-4 py-3 text-sm font-semibold text-hi transition-colors duration-150 hover:border-brand/40 hover:text-brand ${className}`}
        >
          {copied ? (
            <>
              <Check className="size-4 shrink-0" strokeWidth={3} />
              Link copied
            </>
          ) : (
            <>
              <Share2 className="size-4 shrink-0" />
              {text}
            </>
          )}
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          aria-label={copied ? 'Link copied' : `Share this ${noun}`}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`grid ${dims} shrink-0 place-items-center rounded-full transition-colors duration-150 ${tone} ${copied ? '!bg-brand-fill !text-ink' : ''} ${className}`}
        >
          {copied
            ? <Check className={`${iconSize} animate-burst`} strokeWidth={3} />
            : <Share2 className={iconSize} />}
        </button>
      )}

      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label="Share options"
          style={{ position: 'fixed', width: MENU_W, ...pos }}
          className="z-[100] overflow-y-auto overscroll-contain rounded-2xl border border-edge bg-panel py-1 shadow-2xl animate-rise"
        >
          <button type="button" role="menuitem" onClick={copyLink} className={rowClass}>
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-panel-hover">
              <Link2 className="size-3.5 text-mid" />
            </span>
            Copy link
          </button>

          <div className="my-1 border-t border-edge" />

          {PLATFORMS.map(({ id, label, chip, glyph, Icon, href }) => (
            <a
              key={id}
              role="menuitem"
              href={href(url, shareText)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onShare?.() }}
              className={rowClass}
            >
              <span className={`grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold leading-none ${chip}`}>
                {Icon ? <Icon className="size-3.5" /> : glyph}
              </span>
              {label}
            </a>
          ))}

          {/*
            The native sheet is offered as one option among many, not as a
            hijack of the whole button. Tapping share on a phone used to jump
            straight here, which meant Copy link and every destination below
            were unreachable on the platform where sharing happens most.
          */}
          {CAN_NATIVE_SHARE && (
            <>
              <div className="my-1 border-t border-edge" />
              <button type="button" role="menuitem" onClick={nativeShare} className={rowClass}>
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-panel-hover">
                  <Share2 className="size-3.5 text-mid" />
                </span>
                More options…
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
