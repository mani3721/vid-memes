/**
 * React 19 native document-metadata component.
 *
 * React 19 automatically hoists <title>, <meta>, and <link> rendered anywhere
 * in the component tree up to <head>. No HelmetProvider or react-helmet-async
 * needed — the behaviour is built into the React DOM renderer.
 *
 * JSON-LD <script> tags render in-body, which is fully valid per Google's
 * structured-data guidelines (they accept JSON-LD anywhere in the page).
 */
import { SITE_NAME, BASE_URL } from '../utils/seo'

const DEFAULT_DESCRIPTION =
  'Download free meme videos, GIFs, blank templates, and sound effects. No watermark, HD quality, updated daily for creators and comedy fans.'

const DEFAULT_KEYWORDS =
  'meme download, meme video download, free meme download, meme templates, meme sound effects, no watermark memes, funny memes download'

const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`

export default function SEO({
  /** Page-level part only — site name appended automatically */
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  /** Path from root, e.g. "/meme/cat-slams-laptop-a1" */
  canonicalPath = '/',
  ogImage = DEFAULT_OG_IMAGE,
  /** 'website' | 'article' | 'video.other' */
  ogType = 'website',
  /** Array of JSON-LD objects (schema.org) — rendered as inline scripts */
  schemas = [],
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Free Meme Videos, GIFs, Templates & Sound Effects`

  const canonicalUrl = `${BASE_URL}${canonicalPath}`

  return (
    <>
      {/* ── Primary ──────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ───────────────────────────────────────────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* ── Twitter / X card ─────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@videsaur" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD structured data (renders in-body — valid per Google) */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
