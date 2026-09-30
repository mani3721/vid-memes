import Markdown from './Markdown'

const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'])
const ALLOWED_TAGS = new Set([
  'p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'hr',
  'a', 'blockquote', 'pre', 'code',
])

function safeHref(raw = '') {
  const href = raw.trim()
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (/^https:\/\//i.test(href)) return href
  return null
}

function renderNode(node, key) {
  if (node.nodeType === 3) return node.textContent
  if (node.nodeType !== 1) return null

  const tag = node.tagName.toLowerCase()
  if (BLOCKED_TAGS.has(tag)) return null

  const children = Array.from(node.childNodes).map((child, index) =>
    renderNode(child, `${key}-${index}`),
  )

  if (!ALLOWED_TAGS.has(tag)) return children
  if (tag === 'br') return <br key={key} />
  if (tag === 'hr') return <hr key={key} />

  if (tag === 'a') {
    const href = safeHref(node.getAttribute('href'))
    if (!href) return children
    const external = href.startsWith('https://')
    return (
      <a
        key={key}
        href={href}
        {...(external ? { target: '_blank', rel: 'nofollow noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  const Tag = tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag
  return <Tag key={key}>{children}</Tag>
}

/**
 * Safely renders TipTap HTML while keeping compatibility with older Markdown posts.
 * Only the formatting produced by the blog editor is allowed through.
 */
export default function RichContent({ source, className = '' }) {
  if (!source?.trim()) return null

  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(source)
  if (!containsHtml || typeof DOMParser === 'undefined') {
    return <Markdown source={source} className={className} />
  }

  const document = new DOMParser().parseFromString(source, 'text/html')
  const content = Array.from(document.body.childNodes).map((node, index) =>
    renderNode(node, `rich-${index}`),
  )

  return <div className={`rich-content text-mid ${className}`}>{content}</div>
}
