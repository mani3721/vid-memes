import { useCallback, useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/** Kept in sync with REACTIONS in server/routes/reactions.js. */
export const REACTION_KINDS = ['laugh', 'fire', 'skull']

export const REACTION_EMOJI = { laugh: '😂', fire: '🔥', skull: '💀' }
export const REACTION_LABEL = { laugh: 'Funny', fire: 'Fire', skull: 'Dead' }

/**
 * Reactions for a single meme. Works for guests and signed-in users alike —
 * the server keys reactions off an HttpOnly session cookie when there is no
 * account, so nothing here needs to know whether anyone is signed in.
 *
 * @param {string} memeId
 * @param {{laugh: number, fire: number, skull: number}} [initialCounts]
 *        Counts already on the meme row, so numbers render on first paint
 *        instead of after a round trip. May arrive late (or change) as the
 *        meme query resolves.
 */
export function useReactions(memeId, initialCounts) {
  // Only counts this hook has actually changed are held in state; everything
  // else is read straight from initialCounts at render time. Mirroring the
  // props into state with an effect instead would mean a cascading re-render
  // on every meme load, plus a stale-state window in between.
  const [overrides, setOverrides] = useState({})
  const [mine, setMine] = useState(() => new Set())
  const [pending, setPending] = useState(() => new Set())

  // Memoised on the primitive counts rather than on initialCounts itself:
  // callers pass an object literal (asset.reactions), so depending on its
  // identity would rebuild `counts` — and therefore `toggle` — every render.
  const counts = useMemo(
    () => ({
      laugh: overrides.laugh ?? initialCounts?.laugh ?? 0,
      fire: overrides.fire ?? initialCounts?.fire ?? 0,
      skull: overrides.skull ?? initialCounts?.skull ?? 0,
    }),
    [overrides, initialCounts?.laugh, initialCounts?.fire, initialCounts?.skull],
  )

  // Restore which reactions this visitor already holds. credentials:'include'
  // is required — the session cookie is what identifies a guest.
  useEffect(() => {
    if (!memeId) return
    let cancelled = false

    fetch(`${API_BASE}/api/reactions/mine?memeIds=${encodeURIComponent(memeId)}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : { reactions: {} }))
      .then(({ reactions }) => {
        if (!cancelled) setMine(new Set(reactions?.[memeId] ?? []))
      })
      .catch(() => {
        // Offline or blocked — buttons stay unreacted. Never surface this.
      })

    return () => { cancelled = true }
  }, [memeId])

  const toggle = useCallback(
    async (reaction) => {
      if (!memeId || !REACTION_KINDS.includes(reaction)) return
      // Ignore taps while a request for the same reaction is in flight;
      // otherwise a double-tap races and the two responses fight over state.
      if (pending.has(reaction)) return

      const held = mine.has(reaction)
      const before = counts[reaction]

      // Optimistic: the reaction lands instantly, guest or not.
      setPending((prev) => new Set(prev).add(reaction))
      setOverrides((prev) => ({
        ...prev,
        [reaction]: Math.max(before + (held ? -1 : 1), 0),
      }))
      setMine((prev) => {
        const next = new Set(prev)
        held ? next.delete(reaction) : next.add(reaction)
        return next
      })

      try {
        const res = await fetch(`${API_BASE}/api/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ memeId, reaction }),
        })

        if (!res.ok) throw new Error(String(res.status))

        // Reconcile against the authoritative count. This matters beyond
        // error handling: the server is the only thing that knows the real
        // total once other visitors have reacted too.
        const body = await res.json()
        setOverrides((prev) => ({ ...prev, [reaction]: Number(body.total ?? prev[reaction]) }))
        setMine((prev) => {
          const next = new Set(prev)
          body.reacted ? next.add(reaction) : next.delete(reaction)
          return next
        })
      } catch {
        // Roll back to exactly what was displayed before the tap — including
        // the 429 case, where the rate limiter refused the write. The tap just
        // does not stick; no modal, no error toast, no sign-in ask.
        setOverrides((prev) => ({ ...prev, [reaction]: before }))
        setMine((prev) => {
          const next = new Set(prev)
          held ? next.add(reaction) : next.delete(reaction)
          return next
        })
      } finally {
        setPending((prev) => {
          const next = new Set(prev)
          next.delete(reaction)
          return next
        })
      }
    },
    [memeId, mine, pending, counts],
  )

  return { counts, mine, toggle, pending }
}
