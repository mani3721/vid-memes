import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useUnreadCount, useNotificationList } from '../hooks/useNotifications'
import NotificationItem from './NotificationItem'

/** How many rows the dropdown previews. */
const PREVIEW_LIMIT = 8

/**
 * Header notification bell.
 *
 * Renders nothing for guests. Notifications need somewhere durable to keep
 * read/unread state, which a guest has no way to provide — so rather than
 * showing a bell that only ever says "sign in", the affordance is simply
 * absent until it can do something. Sign in / Log in already lives in the
 * profile menu next to it for anyone who wants an account.
 *
 * Desktop opens a dropdown preview; mobile navigates to the full page, where
 * there is room for the list and the filters.
 */
export default function NotificationBell() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const { count, refresh, clear } = useUnreadCount()

  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  // Only fetch the preview list once the dropdown is actually open — the badge
  // count alone drives the header, and pre-fetching eight rows for every
  // visitor who never opens the menu is wasted work.
  const { items, loading, markRead, markAllRead } = useNotificationList({
    limit: PREVIEW_LIMIT,
    mode: 'preview',
    enabled: open,
  })

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Guests and the pre-auth flash get no bell.
  if (authLoading || !user) return null

  function handleClick() {
    if (isDesktop) {
      setOpen((v) => !v)
    } else {
      navigate('/notifications')
    }
  }

  async function handleMarkAll() {
    const ok = await markAllRead()
    // Clear the badge locally first so it responds instantly, then reconcile
    // against the server.
    if (ok) clear()
    refresh()
  }

  function handleActivate(id) {
    markRead(id)
    setOpen(false)
    // The row may not have been counted as unread; refresh rather than
    // decrementing blindly.
    refresh()
  }

  const badge = count > 99 ? '99+' : String(count)

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-label={count > 0 ? `Notifications (${count} unread)` : 'Notifications'}
        aria-haspopup={isDesktop ? 'menu' : undefined}
        aria-expanded={isDesktop ? open : undefined}
        className="relative grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-panel text-mid transition-colors hover:bg-panel-hover hover:text-hi"
      >
        <Bell className="size-4" />

        {count > 0 && (
          <span
            // aria-hidden because the count is already in the button's label;
            // announcing it twice is noise.
            aria-hidden
            className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-canvas"
          >
            {badge}
          </span>
        )}
      </button>

      {open && isDesktop && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-edge bg-panel shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-edge px-3.5 py-2.5">
            <p className="text-sm font-semibold text-hi">Notifications</p>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-[11px] text-mid transition-colors hover:text-brand"
              >
                <CheckCheck className="size-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 divide-y divide-edge overflow-y-auto overscroll-contain">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-10" role="status">
                <Loader2 className="size-4 animate-spin text-brand" />
                <span className="sr-only">Loading notifications</span>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-mid">You&rsquo;re all caught up! 🎉</p>
              </div>
            ) : (
              items.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onActivate={handleActivate}
                />
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-edge px-3.5 py-2.5 text-center text-xs font-medium text-brand transition-colors hover:bg-panel-hover"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
