export const SITE_NAME = 'Videsaur'
export const BASE_URL = 'https://videsaur.co.in'

/** "Cat Slams Laptop Shut" → "cat-slams-laptop-shut" */
export function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/, '')
}

/** Produces the path segment for a meme asset: "cat-slams-laptop-shut-a1" */
export function toMemeSlug(asset) {
  return `${toSlug(asset.title)}-${asset.id}`
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

/** Seconds → ISO 8601 duration: 87 → "PT1M27S" */
export function toDuration(seconds) {
  if (!seconds || seconds === 0) return 'PT0S'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `PT${m > 0 ? `${m}M` : ''}${s > 0 ? `${s}S` : ''}`
}

/** VideoObject schema for a video/gif meme asset */
export function buildVideoSchema(asset, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: asset.title,
    description: `Download ${asset.title} meme video free in HD. ${asset.format} format, no watermark. Perfect for WhatsApp status, Reels, Shorts, and editing.`,
    thumbnailUrl: asset.thumb,
    uploadDate: '2026-08-27',
    duration: toDuration(asset.duration),
    contentUrl: `${BASE_URL}${canonicalUrl}`,
    embedUrl: `${BASE_URL}${canonicalUrl}`,
    author: { '@type': 'Person', name: asset.creator },
    license: asset.license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : undefined,
  }
}

/** ImageObject schema for still meme assets (PNG) */
export function buildImageSchema(asset, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: asset.title,
    description: `Download ${asset.title} meme template free. ${asset.format} format, transparent background${asset.hasAlpha ? ' with alpha channel' : ''}, no watermark.`,
    contentUrl: `${BASE_URL}${canonicalUrl}`,
    thumbnailUrl: asset.thumb,
    uploadDate: '2026-08-27',
    author: { '@type': 'Person', name: asset.creator },
    license: asset.license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : undefined,
  }
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
