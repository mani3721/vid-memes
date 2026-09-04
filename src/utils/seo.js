export const SITE_NAME = 'Videsaur'
export const BASE_URL = 'https://www.videsaur.co.in'

/**
 * "Cat Slams Laptop Shut" → "cat-slams-laptop-shut"
 *
 * ⚠  Mirrored in server/lib/sitemap/urls.js, which builds the <loc> values for
 *    the sitemap. The two must agree byte for byte: if a sitemap URL differs
 *    from the canonical this file renders, Google treats the sitemap URL as a
 *    duplicate and drops it. Change both together.
 */
export function toSlug(str) {
  return String(str ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Path segment for a meme asset: "cat-slams-laptop-shut-a1".
 *
 * Titles with no latin characters (pure Devanagari, emoji-only) slugify to an
 * empty string, so fall back to "meme" rather than emitting a bare "-<id>".
 * slugToId resolves the asset from the trailing id, so the prefix is cosmetic.
 */
export function toMemeSlug(asset) {
  const slug = toSlug(asset.title)
  return `${slug || 'meme'}-${asset.id}`
}

/** Full href for an asset's canonical meme page */
export function toMemeUrl(asset) {
  return `/meme/${toMemeSlug(asset)}`
}

/**
 * Parse the slug back to a meme UUID.
 * Slug format: "{title-slug}-{uuid}" e.g. "cat-slams-laptop-52709905-35dc-4354-8176-0fbc6cb4faa3"
 * UUID is always the last 36 chars (8-4-4-4-12 hex groups).
 */
export function slugToId(slug) {
  const match = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
  return match ? match[1] : slug.split('-').pop()
}

/**
 * Seconds → ISO 8601 duration: 87 → "PT1M27S".
 * Returns null for an unknown duration so callers can omit the property
 * entirely — "PT0S" would assert the asset is zero seconds long.
 */
export function toDuration(seconds) {
  // Round to whole seconds up front: rounding the remainder instead would turn
  // a 0.4s clip into a bare "PT", which is not a valid ISO 8601 duration.
  const total = Math.round(Number(seconds))
  if (!Number.isFinite(total) || total <= 0) return null
  const m = Math.floor(total / 60)
  const s = total % 60
  return `PT${m > 0 ? `${m}M` : ''}${s > 0 ? `${s}S` : ''}`
}

/** Drop undefined/null properties so they never reach the JSON-LD output. */
function defined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null))
}

/** CC0 assets get a machine-readable licence URL; Editorial has no canonical one. */
function licenseUrl(asset) {
  return asset.license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : undefined
}

/** Supabase timestamps → ISO 8601 datetime strings with UTC timezone. */
function toDate(value) {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

/** The spec-derived sentence used when no long description has been written. */
export function templateDescription(asset) {
  return `Download ${asset.title} meme free in HD. ${asset.format} format, no watermark. Perfect for WhatsApp status, Reels, Shorts, and editing.`
}

/**
 * Description for structured data and meta tags.
 *
 * Prefers the "what is this meme" subsection of the long description, because
 * that is the only genuinely per-asset prose available — the template differs
 * between assets only by title and format, which makes every page's
 * description near-duplicate boilerplate.
 *
 * Kept identical to describe() in server/lib/sitemap/generator.js so a page's
 * description and its sitemap <video:description> never disagree.
 */
function describe(asset, maxChars = 320) {
  const authored = asset.description_long?.what
  if (typeof authored === 'string' && authored.trim()) {
    const text = authored.trim().replace(/\s+/g, ' ')
    if (text.length <= maxChars) return text
    const cut = text.slice(0, maxChars)
    const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(' '))
    return `${cut.slice(0, stop > maxChars * 0.5 ? stop : maxChars).trim()}…`
  }
  return templateDescription(asset)
}

/** Meta-description-length variant (search engines truncate around 160 chars). */
export function metaDescription(asset) {
  return describe(asset, 155)
}

/** Uploader display name, falling back to the schema default. */
function authorOf(asset) {
  return { '@type': 'Person', name: asset.creator_name ?? asset.creator ?? 'anonymous' }
}

/** Formats that are genuinely audio-only, and those Google treats as video. */
export const AUDIO_FORMATS = new Set(['MP3', 'WAV'])
export const VIDEO_FORMATS = new Set(['MP4', 'WebM'])

const MIME_BY_FORMAT = {
  MP4: 'video/mp4',
  WebM: 'video/webm',
  GIF: 'image/gif',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
}

/** Download count as a schema.org InteractionCounter, when there is one. */
function downloadStat(asset) {
  const count = asset.download_count ?? asset.editorUses
  if (!count) return undefined
  return {
    '@type': 'InteractionCounter',
    interactionType: { '@type': 'DownloadAction' },
    userInteractionCount: count,
  }
}

/**
 * VideoObject schema for a video meme asset.
 *
 * contentUrl points at the media file, not the page: Google requires a
 * directly fetchable stream there, and pointing it at the HTML page is the
 * single most common reason video rich results fail to appear. uploadDate is
 * likewise a required property, and it must be the asset's real upload date.
 */
export function buildVideoSchema(asset, canonicalUrl) {
  return defined({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: asset.title,
    description: describe(asset),
    thumbnailUrl: asset.thumbnail_url ?? asset.thumb,
    uploadDate: toDate(asset.created_at),
    dateModified: toDate(asset.updated_at),
    duration: toDuration(asset.duration_seconds ?? asset.duration),
    contentUrl: asset.publicUrl ?? asset.public_url,
    url: `${BASE_URL}${canonicalUrl}`,
    width: asset.width_px ?? undefined,
    height: asset.height_px ?? undefined,
    interactionStatistic: downloadStat(asset),
    author: authorOf(asset),
    license: licenseUrl(asset),
  })
}

/** ImageObject schema for still meme assets (PNG/JPEG/WebP) and GIFs. */
export function buildImageSchema(asset, canonicalUrl) {
  return defined({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: asset.title,
    description: `Download ${asset.title} meme template free. ${asset.format} format, transparent background${asset.hasAlpha ? ' with alpha channel' : ''}, no watermark.`,
    contentUrl: asset.publicUrl ?? asset.public_url,
    thumbnailUrl: asset.thumbnail_url ?? asset.thumb,
    url: `${BASE_URL}${canonicalUrl}`,
    uploadDate: toDate(asset.created_at),
    dateModified: toDate(asset.updated_at),
    width: asset.width_px ?? undefined,
    height: asset.height_px ?? undefined,
    encodingFormat: MIME_BY_FORMAT[asset.format],
    interactionStatistic: downloadStat(asset),
    author: authorOf(asset),
    license: licenseUrl(asset),
  })
}

/**
 * AudioObject schema for sound assets (MP3/WAV).
 *
 * There is no audio equivalent of the video sitemap extension, so
 * sitemap-audio.xml can only list the page URLs. This markup is what actually
 * tells a crawler the page is about a downloadable sound, how long it runs and
 * where the file lives — so for audio it is doing the job the video sitemap
 * tags do for MP4s, and it is the reason those URLs are worth listing at all.
 */
export function buildAudioSchema(asset, canonicalUrl) {
  return defined({
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: asset.title,
    description: `Download ${asset.title} meme sound effect free. ${asset.format} format, no watermark. Ready for Reels, Shorts, TikTok and video editing.`,
    contentUrl: asset.publicUrl ?? asset.public_url,
    thumbnailUrl: asset.thumbnail_url ?? asset.thumb,
    url: `${BASE_URL}${canonicalUrl}`,
    uploadDate: toDate(asset.created_at),
    dateModified: toDate(asset.updated_at),
    duration: toDuration(asset.duration_seconds ?? asset.duration),
    encodingFormat: MIME_BY_FORMAT[asset.format],
    contentSize: asset.file_size_bytes ? `${Math.round(asset.file_size_bytes / 1024)}KB` : undefined,
    interactionStatistic: downloadStat(asset),
    author: authorOf(asset),
    license: licenseUrl(asset),
  })
}

/**
 * Picks the right schema for an asset's media type.
 *
 * Keep this as the single dispatch point — MemePage previously fell back to
 * ImageObject for anything that was not MP4/WebM/GIF, which described MP3 and
 * WAV downloads as images.
 */
export function buildMediaSchema(asset, canonicalUrl) {
  if (AUDIO_FORMATS.has(asset.format)) return buildAudioSchema(asset, canonicalUrl)
  if (VIDEO_FORMATS.has(asset.format)) return buildVideoSchema(asset, canonicalUrl)
  return buildImageSchema(asset, canonicalUrl)
}

/** BreadcrumbList schema */
export function buildBreadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(({ name, url }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(url ? { item: `${BASE_URL}${url}` } : {}),
    })),
  }
}

/** WebSite schema with SearchAction for sitelinks search box */
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

/** FAQ schema for homepage */
export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I download memes from Videsaur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click the download button on any meme card. Your file downloads instantly in MP4, GIF, WebM, or PNG format — no account or sign-up required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are Videsaur memes completely free to download?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All memes on Videsaur are free to browse and download with no watermark. No subscription, no login, no hidden fees.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use these memes in commercial YouTube videos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Many assets are available under the CC0 (public domain) license, which permits commercial use. Assets marked Editorial are for non-commercial and transformative use only. Always check the license badge on each meme before monetised publication.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Videsaur have green screen meme clips?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Videsaur offers green screen (chroma key) meme clips and transparent PNG memes with alpha channels, ready to drop into CapCut, Premiere Pro, DaVinci Resolve, or After Effects.',
      },
    },
    {
      '@type': 'Question',
      name: 'What video formats are available for download?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Videsaur offers MP4, GIF, WebM (with optional alpha transparency), and PNG. Meme sound effects are available as standalone audio downloads on the Sounds page.',
      },
    },
  ],
}
