const SIZES = {
  1: 'font-display text-2xl tracking-wide text-hi sm:text-3xl',
  2: 'font-display text-lg tracking-wide text-hi sm:text-xl',
  3: 'text-base font-semibold text-hi',
}

/**
 * Reusable semantic heading that enforces consistent type-scale per level.
 * Pass `keyword` to highlight a substring in brand color.
 */
export default function PageHeading({ level = 1, text, keyword, id, className = '' }) {
  const Tag = `h${level}`
  const base = SIZES[level] ?? SIZES[1]

  if (keyword && text.includes(keyword)) {
    const idx = text.indexOf(keyword)
    const before = text.slice(0, idx)
    const after = text.slice(idx + keyword.length)
    return (
      <Tag id={id} className={`${base} ${className}`}>
        {before}
        <span className={level === 1 ? 'text-brand-gradient' : 'text-brand'}>{keyword}</span>
        {after}
      </Tag>
    )
  }

  return (
    <Tag id={id} className={`${base} ${className}`}>
      {text}
    </Tag>
  )
}
