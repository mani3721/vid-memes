import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'

/**
 * Inline callout shown after a guest hearts a meme.
 *
 * Note the tense: the favorite has ALREADY been saved to localStorage by the
 * time this appears. This is a note about portability, not a gate — the heart
 * works, the card stays interactive, and dismissing this changes nothing about
 * the saved favorite.
 *
 * Layout note: this sits inside a feed card, which can be ~180px wide on a
 * small phone. The copy is short and the label is nowrap on purpose — a
 * two-line message or a "Sign / in" button break looks broken. The text is the
 * only flexible element, so it absorbs the squeeze by truncating while the
 * button and close affordance keep their size.
 */
export default function SignInToFave({ onDismiss }) {
  return (
    <div
      role="status"
      // z-20 keeps this above the card's action overlay (z-10), which shares
      // the same bottom edge.
      className="absolute inset-x-2 bottom-2 z-20 flex items-center gap-2 rounded-lg border border-edge bg-panel px-2.5 py-1.5 shadow-lg animate-rise"
    >
      <Heart className="size-3.5 shrink-0 fill-red-500 text-red-500" aria-hidden />

      <span className="min-w-0 flex-1 truncate text-xs text-mid">Saved on this device</span>

      <Link
        to="/login"
        onClick={(e) => e.stopPropagation()}
        className="btn-primary shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
      >
        Sign in
      </Link>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss() }}
        aria-label="Dismiss"
        className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-mid"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
