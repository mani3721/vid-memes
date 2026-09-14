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
  const bodyHtml = asset.description_long?.body
  const sections = filledSections(asset.description_long)
  const words = countWords(asset.description_long)
  const hasContent = bodyHtml || sections.length > 0

  return (
    <section aria-labelledby="about-meme-heading">
      <h2
        id="about-meme-heading"
        className="mb-4 font-display text-lg tracking-wide text-hi sm:text-xl"
      >
        About This Meme
      </h2>

      {hasContent ? (
        bodyHtml ? (
          // Rich HTML stored by the new editor — admin-authored, not user input.
          // max-w-prose caps the measure at ~65ch for readable line length.
          <div
            className="max-w-prose text-base leading-relaxed text-mid rich-content"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : (
          // Legacy keyed-section format
          <div className="max-w-prose space-y-8">
            {sections.map(({ key, heading, text }) => (
              <div key={key}>
                <h3 className="mb-2 text-base font-bold text-hi">{heading}</h3>
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
        )
      ) : (
        <p className="max-w-prose text-base leading-relaxed text-mid">{fallbackText}</p>
      )}

      {isAdmin && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-lo">
          <PenLine aria-hidden className="size-3.5" />
          {hasContent ? (
            <>
              {words} words ·{' '}
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
