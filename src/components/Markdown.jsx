import { Link } from 'react-router-dom'

/**
 * Deliberately minimal Markdown renderer.
 *
 * Blog bodies are admin-authored, but "trusted author" is not a safety model —
 * a compromised admin account, or a paste from an untrusted source, would
 * otherwise put arbitrary HTML on the page. So this produces React elements
 * only and never touches dangerouslySetInnerHTML: anything it does not
 * recognise renders as literal text rather than markup.
 *
 * Supported: ## / ### headings, paragraphs, - lists, > quotes, **bold**,
 * *italic*, `code`, and [links](url). That covers editorial posts without
 * pulling in a parser and a sanitiser.
 */

/**
 * Only same-origin paths and https URLs may become links.
 *
 * The leading-slash check must reject "//" as well: a protocol-relative URL
 * like //evil.com looks like a path but the browser resolves it to another
 * origin, which would turn an admin-authored post into an off-site redirect.
 */
function safeHref(raw) {
  const href = raw.trim()
  if (href.startsWith('//')) return null
  if (href.startsWith('/')) return { to: href }
  if (/^https:\/\//i.test(href)) return { href }
  return null
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g

/** Split one line into text and inline-formatted spans. */
function renderInline(text, keyPrefix) {
  return text.split(INLINE).filter(Boolean).map((token, i) => {
    const key = `${keyPrefix}-${i}`

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key} className="font-semibold text-hi">{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={key} className="rounded bg-panel-hover px-1 py-0.5 text-[0.9em]">{token.slice(1, -1)}</code>
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }

    const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      const target = safeHref(link[2])
      // An unsupported scheme degrades to the label text — never a live link.
      if (!target) return <span key={key}>{link[1]}</span>
      if (target.to) {
        return <Link key={key} to={target.to} className="text-brand underline hover:no-underline">{link[1]}</Link>
      }
      return (
        <a key={key} href={target.href} rel="nofollow noreferrer" target="_blank" className="text-brand underline hover:no-underline">
          {link[1]}
        </a>
      )
    }

    return <span key={key}>{token}</span>
  })
}

export default function Markdown({ source, className = '' }) {
  if (!source?.trim()) return null

  // Blank lines separate blocks; everything else is decided per block.
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/)

  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((raw, blockIndex) => {
        const block = raw.trim()
        if (!block) return null
        const key = `b${blockIndex}`

        if (block.startsWith('### ')) {
          return <h3 key={key} className="mt-6 font-display text-base tracking-wide text-hi">{renderInline(block.slice(4), key)}</h3>
        }
        if (block.startsWith('## ')) {
          return <h2 key={key} className="mt-8 font-display text-lg tracking-wide text-hi sm:text-xl">{renderInline(block.slice(3), key)}</h2>
        }

        const lines = block.split('\n')

        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-mid">
              {lines.map((line, i) => (
                <li key={`${key}-${i}`}>{renderInline(line.replace(/^\s*[-*]\s+/, ''), `${key}-${i}`)}</li>
              ))}
            </ul>
          )
        }

        if (lines.every((l) => l.startsWith('>'))) {
          return (
            <blockquote key={key} className="border-l-2 border-brand/50 pl-4 text-sm italic leading-relaxed text-mid">
              {renderInline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '), key)}
            </blockquote>
          )
        }

        return (
          <p key={key} className="text-sm leading-relaxed text-mid">
            {renderInline(block.replace(/\n/g, ' '), key)}
          </p>
        )
      })}
    </div>
  )
}
