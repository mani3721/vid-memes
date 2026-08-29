import { useCallback, useRef, useState } from 'react'
import { ADSENSE_CLIENT } from '../config/site'
import { useConsent } from '../consent/consentStore'
import { fillSlot, loadAdSense } from '../consent/adsense'

/**
 * Minimum edge-to-edge distance, in CSS pixels, between an ad slot and any
 * download / play / navigation control. Enforced at runtime, not by convention.
 */
export const MIN_GAP_PX = 150

/**
 * Placements this component is willing to render in. Anything else is a
 * programming error and renders nothing.
 *
 * `sidebar` and `article` are defined because AdSlot is generic, but no slot is
 * currently placed in either — see COMPLIANCE.md for why Editor Mode carries no
 * ads at all.
 */
const ALLOWED_CONTEXTS = {
  'feed-gap': 'Between two full content blocks in the browse feed.',
  'pre-footer': 'After the last content block, before the footer navigation.',
  article: 'Inside long-form prose, between paragraphs.',
  sidebar: 'A column with no download, play or bulk-action controls.',
}

/** Edge-to-edge distance between two rects; 0 when they overlap. */
function rectGap(a, b) {
  const dx = Math.max(b.left - a.right, a.left - b.right, 0)
  const dy = Math.max(b.top - a.bottom, a.top - b.bottom, 0)
  return Math.hypot(dx, dy)
}

/**
 * Audits a slot's actual position in the live DOM and returns a violation
 * string, or null when the placement is compliant.
 *
 * Two independent checks:
 *  1. Structural — no sibling in the same container may be, or contain, an
 *     element marked [data-ad-unsafe]. This catches "ad next to the download
 *     button" regardless of how the CSS happens to lay out.
 *  2. Geometric — nothing marked [data-ad-unsafe] may be within MIN_GAP_PX.
 *
 * Fixed and sticky elements are skipped by the geometric check: they travel
 * with the viewport, so their distance to a document-flow ad is meaningless.
 * They are handled by policy instead (no ads in Editor Mode, where the sticky
 * bulk-action bar lives).
 */
export function auditPlacement(el, context) {
  if (!ALLOWED_CONTEXTS[context]) {
    return `unknown context "${context}" — allowed: ${Object.keys(ALLOWED_CONTEXTS).join(', ')}`
  }

  const container = el.parentElement
  if (container) {
    for (const sibling of container.children) {
      if (sibling === el) continue
      const unsafe =
        (sibling.matches?.('[data-ad-unsafe]') && sibling) ||
        sibling.querySelector?.('[data-ad-unsafe]')
      if (unsafe) {
        return `direct sibling contains a "${unsafe.getAttribute('data-ad-unsafe')}" control`
      }
    }
  }

  const box = el.getBoundingClientRect()
  for (const node of document.querySelectorAll('[data-ad-unsafe]')) {
    const { position } = window.getComputedStyle(node)
    if (position === 'fixed' || position === 'sticky') continue

    const gap = rectGap(box, node.getBoundingClientRect())
    if (gap < MIN_GAP_PX) {
      const kind = node.getAttribute('data-ad-unsafe')
      return `a "${kind}" control is ${Math.round(gap)}px away (minimum is ${MIN_GAP_PX}px)`
    }
  }

  return null
}

/**
 * Policy-enforcing ad container.
 *
 * Renders nothing at all unless: the context is allowed, the live placement
 * audit passes, consent has been granted, and a publisher ID is configured.
 * The "Advertisement" label is emitted by this component so no caller can
 * mislabel or omit it.
 */
export default function AdSlot({ context, className = '' }) {
  const { adsAllowed } = useConsent()
  const [violation, setViolation] = useState(null)
  const [failed, setFailed] = useState(false)
  const insRef = useRef(null)
  const pushed = useRef(false)

  /*
   * Audit on attach (a ref callback runs in the same commit, so siblings are
   * already in the DOM) and again on resize, since a reflow can move a
   * download button closer. The wrapper stays mounted either way so a slot
   * that is blocked by a transient layout can recover.
   */
  const auditRef = useCallback(
    (el) => {
      if (!el) return undefined

      const run = () => setViolation(auditPlacement(el, context))
      run()

      window.addEventListener('resize', run)
      return () => window.removeEventListener('resize', run)
    },
    [context],
  )

  /* Loads the tag only once consent is in hand, then fills this one slot. */
  const mountAd = useCallback(
    (el) => {
      if (!el || pushed.current || !adsAllowed || !ADSENSE_CLIENT) return
      insRef.current = el
      pushed.current = true

      loadAdSense(ADSENSE_CLIENT)
        .then(fillSlot)
        .catch(() => setFailed(true))
    },
    [adsAllowed],
  )

  if (violation && import.meta.env.DEV) {
    console.warn(
      `[AdSlot] refusing to render "${context}": ${violation}. ` +
        'See the ad placement rules in COMPLIANCE.md.',
    )
  }

  const blocked = Boolean(violation) || !adsAllowed || !ADSENSE_CLIENT || failed

  return (
    <aside
      ref={auditRef}
      // Not labelled as an ad when nothing renders — an empty "Advertisement"
      // heading over blank space is itself misleading.
      aria-label={blocked ? undefined : 'Advertisement'}
      className={blocked ? 'h-0' : `my-40 ${className}`}
    >
      {blocked ? null : (
        <div className="mx-auto max-w-3xl border-y border-dashed border-edge bg-panel/60 px-4 py-5">
          {/*
            Deliberately plain: no rounded corners, no pill, no violet, no
            shadow, no motion. Nothing here may resemble a download CTA or a
            meme card, and nothing animates to attract the eye.
          */}
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mid">
            Advertisement
          </p>
          <ins
            ref={mountAd}
            className="adsbygoogle block min-h-24 w-full"
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot=""
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </aside>
  )
}
