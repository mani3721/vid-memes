import { Link } from 'react-router-dom'
import { Sparkles, Megaphone, Info, Trophy } from 'lucide-react'
import { timeAgo } from '../data/assets'

/**
 * Per-type presentation. Shared by the header dropdown and the full page so
 * the same notification cannot look like two different things in two places.
 */
const TYPE_META = {
  new_content:  { label: 'New Meme',     Icon: Sparkles },
  announcement: { label: 'Announcement', Icon: Megaphone },
  system:       { label: 'System',       Icon: Info },
  milestone:    { label: 'Milestone',    Icon: Trophy },
}

/**
 * One notification row.
 *
 * Unread rows sit on the hover surface (panel-hover, #22222C) with a brand
 * dot; read rows sit on the standard card surface (panel, #181820). That is
 * the whole visual distinction — no badge, no bold text — so a list of mostly
 * read items stays calm.
 *
 * @param {object}   notification
 * @param {boolean}  compact       — dropdown density vs. full-page density
 * @param {Function} onActivate    — called on click, for marking read
 */
export default function NotificationItem({ notification, compact = false, onActivate }) {
  const { id, type, title, message, link, thumbnail, created_at, read } = notification
  const { label, Icon } = TYPE_META[type] ?? TYPE_META.system

  const body = (
    <>
      {/* Thumbnail when the notification points at specific content,
          otherwise the category icon. */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          aria-hidden
          loading="lazy"
          className={`${compact ? 'size-9' : 'size-12'} shrink-0 rounded-lg border border-edge object-cover`}
        />
      ) : (
        <span
          aria-hidden
          className={`grid ${compact ? 'size-9' : 'size-12'} shrink-0 place-items-center rounded-lg border border-edge bg-panel-hover`}
        >
          <Icon className="size-4 text-brand" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        {!compact && (
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-edge px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mid">
            <Icon className="size-3" aria-hidden />
            {label}
          </span>
        )}

        <span className={`block font-medium text-hi ${compact ? 'line-clamp-2 text-xs' : 'text-sm'}`}>
          {title}
        </span>

        {message && (
          <span className={`mt-0.5 block text-mid ${compact ? 'line-clamp-1 text-[11px]' : 'line-clamp-2 text-xs'}`}>
            {message}
          </span>
        )}

        <span className="mt-1 block text-[11px] text-lo">
          {/* Screen readers get the absolute time; sighted users get "2h ago". */}
          <time dateTime={created_at}>{timeAgo(created_at) ?? ''}</time>
        </span>
      </span>

      {/* Unread dot — the only always-on affordance, so it must not be the
          only cue (the background differs too, for anyone who cannot
          distinguish the dot). */}
      {!read && (
        <span
          aria-hidden
          className="mt-1.5 size-2 shrink-0 self-start rounded-full bg-brand"
        />
      )}
    </>
  )

  const rowClass = [
    'flex w-full gap-3 text-left transition-colors',
    compact ? 'px-3 py-2.5' : 'rounded-xl border border-edge p-3.5',
    read ? 'bg-panel hover:bg-panel-hover' : 'bg-panel-hover hover:bg-panel-hover/80',
  ].join(' ')

  const ariaLabel = `${label}: ${title}${read ? '' : ' (unread)'}`

  // A notification without a link is still a real item that can be read — it
  // just is not navigation, so it renders as a button rather than a dead
  // anchor with no href.
  if (!link) {
    return (
      <button type="button" onClick={() => onActivate?.(id)} aria-label={ariaLabel} className={rowClass}>
        {body}
      </button>
    )
  }

  return (
    <Link to={link} onClick={() => onActivate?.(id)} aria-label={ariaLabel} className={rowClass}>
      {body}
    </Link>
  )
}
