import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { readGuestPrefs, writeGuestPref } from '../lib/guestSession'
import { useState } from 'react'

/**
 * Soft, dismissible sign-in nudge.
 *
 * This is the ONLY sanctioned way to surface a sign-in benefit to a guest.
 * It never blocks the action it describes — the action has already succeeded
 * locally by the time this renders. No modals, no full-page walls, no
 * "sign in to continue".
 *
 * @param {string} id       — stable key; a dismissal is remembered under it
 * @param {string} message  — the specific benefit, not a generic demand
 * @param {string} cta      — link label
 */
export default function GuestPrompt({
  id,
  message,
  cta = 'Sign in',
  className = '',
}) {
  const [dismissed, setDismissed] = useState(() => Boolean(readGuestPrefs()[`dismissed_${id}`]))

  function dismiss() {
    setDismissed(true)
    writeGuestPref(`dismissed_${id}`, true)
  }

  if (dismissed) return null

  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-xl border border-edge bg-panel px-3.5 py-2.5 ${className}`}
    >
      <p className="text-xs text-mid">{message}</p>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/login"
          className="rounded-full bg-brand px-3 py-1 text-xs font-medium text-ink transition-colors hover:bg-brand-2"
        >
          {cta}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid size-5 place-items-center rounded-full text-lo transition-colors hover:text-mid"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  )
}
