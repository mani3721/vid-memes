import { Link } from 'react-router-dom'
import { useConsent } from '../consent/consentStore'

/**
 * GDPR / CCPA cookie consent banner.
 *
 * Shows on first visit when no choice has been made (choice === null).
 * Disappears permanently once the user makes any selection — that choice is
 * persisted in localStorage via ConsentProvider.
 *
 * Policy constraints this component enforces:
 *  - No ad scripts ever load before `acceptAll()` is called.
 *  - "Accept" is NOT pre-selected — affirmative opt-in only, per Google's EU
 *    user consent policy and GDPR Article 6(1)(a).
 *  - The banner links to the full Privacy Policy page.
 *  - "Essential only" / reject path is equally prominent as accept.
 */
export default function CookieBanner() {
  const { decided, acceptAll, rejectAll } = useConsent()

  if (decided) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-heading"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-edge bg-canvas/95 shadow-2xl shadow-black/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
        <div className="min-w-0 flex-1">
          <p id="cookie-banner-heading" className="mb-1 text-sm font-semibold text-hi">
            Your cookie preferences
          </p>
          <p className="text-xs leading-relaxed text-mid">
            Videsaur uses cookies to serve personalised ads through Google AdSense and to
            analyse site traffic. Only essential cookies load without your consent. Read our{' '}
            <Link
              to="/privacy"
              className="text-hi underline underline-offset-2 transition-colors hover:text-volt"
            >
              Privacy Policy
            </Link>{' '}
            for full details.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full border border-edge px-5 py-2.5 text-sm font-semibold text-mid transition-colors duration-150 hover:border-white/30 hover:text-hi"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-volt-hi"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
