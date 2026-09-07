import { Link } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import { countWords, filledSections } from '../utils/contentSections'

/**
 * The "About This Meme" block.
 *
 * <h2> for the section, <h3> per subsection — the hierarchy crawlers use to
 * read the page's structure, and the reason description_long is stored keyed by
 * subsection rather than as one blob.
 *
 * When no long description has been written yet this renders the short
 * spec-derived sentence and stops. It deliberately does NOT synthesise
 * paragraphs from the title and format: templated prose repeated across every
 * asset is exactly the low-value content the long description exists to fix,
 * and shipping it would make the problem harder to find rather than solve it.
 * Admins get a link to write the real thing instead.
 *
 * @param {{
 *   asset: object,
 *   fallbackText: string,
 *   isAdmin?: boolean,
 * }} props
 */
export default function MemeDescription({ asset, fallbackText, isAdmin = false }) {
  const sections = filledSections(asset.description_long)
  const words = countWords(asset.description_long)

  return (
    <section aria-labelledby="about-meme-heading">
      <h2
        id="about-meme-heading"
        className="mb-4 font-display text-lg tracking-wide text-hi sm:text-xl"
      >
        About This Meme
      </h2>

      {sections.length > 0 ? (
        // max-w-prose caps the measure at ~65ch. Long-form copy set to the full
        // container width forces the eye to track too far to find the next line.
        <div className="max-w-prose space-y-8">
          {sections.map(({ key, heading, text }) => (
            <div key={key}>
              {/* text-hi, not text-white: white heading on the light theme's
                  #F8F8FA canvas is 1.0:1 — invisible. text-hi resolves per
                  theme (16.2:1 dark / 16.9:1 light). */}
              <h3 className="mb-2 text-base font-bold text-hi">{heading}</h3>
              {/*
                Split on blank lines so an author can write more than one
                paragraph per subsection. Rendered as text nodes — never
                dangerouslySetInnerHTML — so admin-authored copy cannot inject
                markup into the page.

                text-mid is the theme-aware equivalent of zinc-300/gray-400:
                6.8:1 dark, 5.2:1 light — both clear WCAG AA (4.5:1) for body text.
              */}
              <div className="space-y-4">
                {text.split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-mid">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="max-w-prose text-base leading-relaxed text-mid">{fallbackText}</p>
      )}

      {isAdmin && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-lo">
          <PenLine aria-hidden className="size-3.5" />
          {sections.length > 0 ? (
            <>
              {words} words across {sections.length} of 5 sections ·{' '}
              <Link to="/admin" className="underline hover:text-brand">Edit in Content Editor</Link>
            </>
          ) : (
            <>
              No long description yet — this page is thin.{' '}
              <Link to="/admin" className="underline hover:text-brand">Write one</Link>
            </>
          )}
        </p>
      )}
    </section>
  )
}
