/**
 * The subsections of a meme's long-form description, in render order.
 *
 * ⚠  Mirrors DESCRIPTION_SECTIONS in server/lib/contentSchema.js, which
 *    validates what the admin editor saves. Keep the key lists identical — a
 *    key present here but not there can never be saved, and a key saved there
 *    but missing here is silently never rendered.
 *
 * `heading` is emitted as an <h3> under the "About This Meme" <h2>, giving the
 * heading hierarchy crawlers use to understand the page's structure.
 */
export const DESCRIPTION_SECTIONS = [
  { key: 'what', heading: 'What is this meme' },
  { key: 'why', heading: 'Why people use it' },
  { key: 'how', heading: 'How to use this meme' },
  { key: 'quality', heading: 'Format & quality' },
  { key: 'related', heading: 'Related memes' },
]

export const SECTION_KEYS = DESCRIPTION_SECTIONS.map((s) => s.key)

/**
 * Publication states, matching the content_status CHECK constraint in
 * db/migrations/003_content_depth.sql and CONTENT_STATUSES in
 * server/lib/contentSchema.js.
 */
export const CONTENT_STATUSES = ['draft', 'published', 'flagged', 'removed']

/** Sections that actually have prose, in order. */
export function filledSections(descriptionLong) {
  if (!descriptionLong || typeof descriptionLong !== 'object') return []
  return DESCRIPTION_SECTIONS.map(({ key, heading }) => ({
    key,
    heading,
    text: typeof descriptionLong[key] === 'string' ? descriptionLong[key].trim() : '',
  })).filter((s) => s.text)
}

/** Total words across every populated section. */
export function countWords(descriptionLong) {
  return filledSections(descriptionLong).reduce(
    (total, s) => total + s.text.split(/\s+/).filter(Boolean).length,
    0,
  )
}
