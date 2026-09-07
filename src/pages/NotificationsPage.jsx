import { Link } from 'react-router-dom'
import { Bell, BellOff, CheckCheck, Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useNotificationList, NOTIFICATION_FILTERS } from '../hooks/useNotifications'
import NotificationItem from '../components/NotificationItem'
import SEO from '../components/SEO'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()

  const { items, type, setType, loading, error, hasMore, loadMore, markRead, markAllRead } =
    useNotificationList({ enabled: Boolean(user) })

  const hasUnread = items.some((n) => !n.read)

  return (
    <>
      <SEO
        title="Notifications — Videsaur"
        description="Your Videsaur notifications: new content, announcements and account updates."
        canonicalPath="/notifications"
        // Nothing here is public or useful to a crawler, and the page is
        // empty without a session.
        noindex
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="flex items-center gap-2 font-display text-lg tracking-wide text-hi">
            <Bell className="size-5 text-brand" />
            Notifications
          </h1>

          {user && hasUnread && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-mid transition-colors hover:text-brand"
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/*
          Notifications are one of the few genuinely account-only surfaces —
          read/unread state needs a durable identity. Unlike the rest of the
          site this page cannot show a guest anything, so it explains why and
          offers the action, rather than silently rendering an empty list.
        */}
        {!authLoading && !user ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-edge py-20 text-center">
            <BellOff className="size-10 text-lo/40" />
            <div>
              <p className="text-sm font-medium text-mid">Sign in to get notified</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-lo">
                We&rsquo;ll tell you when new memes land in the categories you save, plus site
                announcements. Browsing, searching and downloading never need an account.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brand-2"
            >
              <LogIn className="size-4" />
              Sign in
            </Link>
          </div>
        ) : (
          <>
            {/* Type filters */}
            <div role="tablist" aria-label="Filter notifications" className="flex flex-wrap gap-1.5">
              {NOTIFICATION_FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={type === id}
                  onClick={() => setType(id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    type === id
                      ? 'border-brand bg-brand text-ink'
                      : 'border-edge bg-panel text-mid hover:border-mist/50 hover:text-hi'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-16" role="status">
                <Loader2 className="size-5 animate-spin text-brand" />
                <span className="sr-only">Loading notifications</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge py-20 text-center">
                <span aria-hidden className="text-4xl">🎉</span>
                <p className="text-sm font-medium text-mid">You&rsquo;re all caught up!</p>
                <p className="text-xs text-lo">
                  {type === 'all'
                    ? 'New notifications will show up here.'
                    : 'Nothing in this category yet.'}
                </p>
              </div>
            ) : (
              <>
                <ul className="flex flex-col gap-2">
                  {items.map((n) => (
                    <li key={n.id}>
                      <NotificationItem notification={n} onActivate={markRead} />
                    </li>
                  ))}
                </ul>

                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="mx-auto mt-2 inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-medium text-mid transition-colors hover:bg-panel-hover hover:text-hi disabled:opacity-60"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    {loading ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
