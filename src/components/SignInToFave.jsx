import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'

/**
 * Inline callout shown when a guest user clicks the heart on a meme card.
 * Positioned absolute inside the card's overflow container.
 */
export default function SignInToFave({ onDismiss }) {
  return (
    <div
      role="status"
      className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-between gap-2 rounded-lg border border-edge bg-panel px-3 py-2 shadow-lg animate-rise"
    >
      <span className="flex items-center gap-1.5 text-xs text-mid">
        <Heart className="size-3.5 shrink-0 text-mid" aria-hidden />
        Sign in to save
      </span>

      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="rounded-full bg-brand px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-brand-2"
        >
          Sign in
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid size-5 place-items-center rounded-full text-lo transition-colors hover:text-mid"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  )
}
