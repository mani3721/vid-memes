import { compact } from '../data/assets'
import {
  useReactions,
  REACTION_KINDS,
  REACTION_EMOJI,
  REACTION_LABEL,
} from '../hooks/useReactions'

/**
 * Reaction row for a meme detail page.
 *
 * Open to guests by design — no sign-in check, no prompt, no interstitial.
 * The server de-duplicates per browser session and rate-limits per IP, so
 * abuse is handled without asking anyone to create an account.
 *
 * @param {string} memeId
 * @param {{laugh: number, fire: number, skull: number}} reactions — initial counts
 */
export default function ReactionBar({ memeId, reactions, className = '' }) {
  const { counts, mine, toggle, pending } = useReactions(memeId, reactions)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {REACTION_KINDS.map((kind) => {
        const held = mine.has(kind)
        const busy = pending.has(kind)

        return (
          <button
            key={kind}
            type="button"
            onClick={() => toggle(kind)}
            aria-pressed={held}
            aria-label={`${REACTION_LABEL[kind]} — ${counts[kind]} reactions`}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ${
              held
                ? 'border-brand bg-brand/15 text-hi'
                : 'border-edge bg-panel text-mid hover:border-mist/50 hover:text-hi'
            } ${busy ? 'opacity-70' : ''}`}
          >
            <span aria-hidden className="text-base leading-none">{REACTION_EMOJI[kind]}</span>
            <span className="font-semibold tabular-nums">{compact(counts[kind])}</span>
          </button>
        )
      })}
    </div>
  )
}
