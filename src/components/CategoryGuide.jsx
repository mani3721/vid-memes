import { CATEGORY_GUIDES } from '../data/categoryGuides'

export default function CategoryGuide({ category }) {
  const guide = CATEGORY_GUIDES[category]
  if (!guide) return null

  return (
    <section className="space-y-5 rounded-2xl border border-edge bg-panel p-6 text-sm leading-7 text-mid" aria-label={`${guide.title} editing guide`}>
      {guide.sections.map(([heading, text]) => (
        <section key={heading}>
          <h2 className="mb-2 text-lg font-semibold text-hi">{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
    </section>
  )
}
