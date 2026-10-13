#!/usr/bin/env node
/**
 * Compile static HTML for every published asset route by string templating,
 * with no browser and no rendering engine. Run after Vite via `npm run build`.
 *
 * These profiles are editorial guidance, not verified histories of the clips.
 * Metadata alone cannot guarantee unique reporting, search rankings, AdSense
 * approval, ownership, public-domain status, or a fair-use determination.
 *
 * Because nothing executes the app bundle, the emitted markup is the crawlable
 * baseline only — it is not React's rendered output. Head metadata, JSON-LD and
 * the asset profile are authored here; the interactive page still mounts on top
 * of it for real visitors.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import {
  BASE_URL,
  SITE_NAME,
  assetPathPrefix,
  buildBreadcrumbSchema,
  buildMediaSchema,
  metaDescription,
  toMemeSlug,
} from './src/utils/seo.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(ROOT, 'dist')
const PROFILE_ID = 'videsaur-asset-data-profile'
const ROOT_OPEN = '<div id="root">'

/** Parallel compile+write workers. Each holds one page string at a time. */
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY) || 24

/**
 * Upper bound for the single catalog query. Supabase also applies its own
 * server-side row cap, so a result that exactly fills this is treated as a
 * truncated read rather than a complete catalog — see run().
 */
const MAX_ROWS = 5000

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * Titles, tags and licence labels are operator-supplied database text being
 * concatenated into static HTML, so every interpolation is escaped here. The
 * browser's DOM serializer used to provide this for free.
 */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/** Escapes `<` so asset text can never close the surrounding <script> block. */
function serializeSchema(schema) {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function cleanText(value, fallback = '') {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() || fallback : fallback
}

function normalizedTags(asset) {
  // The current schema calls these mood_tags; newer rows may also have tags.
  return [...new Set([asset.tags, asset.mood_tags].flatMap((value) =>
    Array.isArray(value) ? value.map((tag) => cleanText(tag)).filter(Boolean) : [],
  ))]
}

function classifyAsset(asset, title, tags) {
  const signals = `${title} ${tags.join(' ')}`.toLowerCase()
  if (asset.green_screen === true || /\bgreen[ -]?screen\b/.test(signals)) {
    return {
      niche: 'green-screen compositing and reaction overlays',
      emotion: 'the contrast between an expressive subject and a deliberately changed setting',
      edit: 'Place the subject above your own footage, sample the green background with a chroma key, and refine spill suppression before adjusting scale. Inspect hair and fast-moving edges at full resolution; avoid cropping away the gesture that makes the overlay readable.',
    }
  }
  if (asset.has_alpha === true) {
    return {
      niche: 'transparent overlays and layered visual punchlines',
      emotion: 'the contrast between a foreground gesture and the scene behind it',
      edit: 'Place the transparent layer above your footage and confirm that your editor preserves its alpha channel. Inspect edge halos against both light and dark backgrounds. Anchor the overlay away from faces, captions, and interface controls rather than filling the entire frame.',
    }
  }
  if (/\b(ishowspeed|i show speed|speed reaction|shock|shocked|scream|surprised|rage)\b/.test(signals)) {
    return {
      niche: 'high-energy reactions and surprise-driven punchlines',
      emotion: 'surprise, disbelief, or exaggerated tension suggested by its catalog labels',
      edit: 'Locate the strongest reaction while previewing the source, then cut in immediately after the setup rather than revealing the punchline early. Keep enough lead-in to make the expression legible. Reduce abrupt audio peaks and return to your original scene before the reaction becomes repetitive.',
    }
  }
  if (/\b(loop|loopable|transition|seamless)\b/.test(signals) || asset.format === 'GIF') {
    return {
      niche: 'loopable visual beats and transition-based humor',
      emotion: 'anticipation and rhythmic familiarity created by a repeating visual beat',
      edit: 'Compare the opening and closing frames before repeating the clip. Trim to a matching pose or movement, align the cut with a beat in your own soundtrack, and preview at normal speed. Prefer a clean match cut over a long dissolve that blurs the focal action.',
    }
  }
  if (['MP3', 'WAV'].includes(asset.format)) {
    return {
      niche: 'sound-led punctuation and auditory reaction humor',
      emotion: 'an audible change in emphasis that can underline a reveal or comic pause',
      edit: 'Audition the sound against your dialogue before positioning it at a reveal. Trim unnecessary silence, add short fades to avoid clicks, and lower competing music with keyframes. Keep the spoken setup intelligible and avoid stacking multiple loud effects on the same beat.',
    }
  }
  if (asset.format === 'PNG' || asset.category === 'images') {
    return {
      niche: 'still-image reactions and caption-led visual humor',
      emotion: 'recognition or contrast between an image and an original caption',
      edit: 'Crop a duplicate rather than overwriting the source image, preserving the face, gesture, or object that carries the joke. Use a restrained scale keyframe if motion is needed. Place your original caption in a separate layer and hold the image long enough to read it.',
    }
  }
  return {
    niche: 'context-dependent reactions and short-form visual commentary',
    emotion: 'a change in tone between the setup and a creator-defined response',
    edit: 'Preview the complete source to locate a readable expression or movement before choosing an in and out point. Cut after your original setup, preserve the focal subject when reframing, and return to your own footage promptly. Use a simple cut unless a transition clarifies the joke.',
  }
}

/** Three readable sections, at least 300 words, without invented provenance. */
export function generateAssetProfile(asset = {}) {
  const title = cleanText(asset.title, 'Untitled meme asset')
  const category = cleanText(asset.category, 'general meme media')
  const tags = normalizedTags(asset)
  const tagSequence = tags.length ? tags.join(', ') : 'general digital humor (no specific tags supplied)'
  const archetype = classifyAsset(asset, title, tags)
  const format = cleanText(asset.format, 'an unspecified media format')
  const width = Number(asset.width_px)
  const height = Number(asset.height_px)
  const dimensions = width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height)
    ? `The catalog lists a ${width} by ${height} pixel frame; compare that source shape with your target canvas before reframing.`
    : 'Source dimensions are not listed; inspect the imported media before choosing a crop or enlarging it.'
  const duration = Number(asset.duration_seconds)
  const timing = duration > 0 && Number.isFinite(duration)
    ? `Its listed duration is ${duration} seconds, so choose only the portion needed to communicate your point.`
    : 'A reliable duration is not listed; set your edit points by previewing the source instead of assuming a fixed clip length.'
  const license = cleanText(asset.license)
  const licenseStatement = license
    ? `The database labels this item as ${license}; that catalog label is not independent verification of ownership or permission.`
    : 'No license label is available for this item, so do not assume permission for redistribution or commercial reuse.'

  const sections = [
    {
      heading: 'Cultural context and core archetype',
      text: `“${title}” is cataloged in the ${category} category with the descriptors ${tagSequence}. Those searchable labels position this asset within ${archetype.niche}, rather than establishing a verified origin story or proving who first published it. For an editor, its potential emotional anchor is ${archetype.emotion}. Treat that interpretation as a starting point: preview the actual media and check whether the expression, movement, or sound supports the joke you intend to tell. A useful placement connects the asset to a recognizable setup, such as an unexpected result, a disagreement, or a self-aware correction. Explain that connection through your own narration or captions instead of relying on viewers to recognize an unexplained reference. The title and tags describe catalog context, not confirmed appearances, creator endorsements, or historical significance.`,
    },
    {
      heading: 'Creative splicing and production guidelines',
      text: `Build an original sequence around “${title}” in CapCut, Premiere Pro, or DaVinci Resolve, importing the ${format} source onto a separate track so trims remain reversible. ${archetype.edit} ${dimensions} ${timing} For YouTube Shorts, Instagram Reels, and TikTok, preview a vertical composition and keep important expressions and captions away from platform interface overlays. Place the setup before the insert and an original payoff after it; this makes the asset part of an argument or story rather than the entire upload. Test pacing with sound both enabled and muted, checking that captions still communicate the intended contrast. Compare alternate cut lengths using your own audience-retention data instead of assuming that a louder reaction or faster transition automatically improves performance. Export a short test and inspect cropping, caption readability, and audio balance on a phone before publishing.`,
    },
    {
      heading: 'Transformative use, fair use, and licensing',
      text: `Videsaur catalogs “${title}” as a publicly accessible pop-culture reference for creative planning, commentary, and educational parody; public accessibility does not make the underlying work public domain. ${licenseStatement} A transformative project should contribute new meaning through criticism, explanation, comparison, or a clearly contextualized joke, rather than simply reposting the original file. Use only the portion necessary for that purpose and consider the source, your intended audience, and the effect on the original work's market. Fair use and other copyright exceptions depend on jurisdiction and the facts of each use; neither editing the clip nor adding credit guarantees protection. Music, likenesses, trademarks, and third-party material can carry separate restrictions. Verify source rights and applicable license terms, obtain permission where necessary, and retain a record of your checks before monetizing a finished production. This profile offers practical guidance, not legal advice or a rights clearance.`,
    },
  ]
  const wordCount = sections.map(({ text }) => text).join(' ').split(/\s+/u).filter(Boolean).length
  if (wordCount < 300) throw new Error(`Asset profile is too short: ${wordCount} words`)
  return { title, sections, wordCount }
}

/**
 * Splits the Vite shell at the #root boundary so per-route markup can be
 * swapped in. Rejects a shell that already carries rendered output, which is
 * what a stale dist left behind by an earlier prerender looks like.
 */
function splitTemplate(template) {
  const titles = (template.match(/<title>/gi) ?? []).length
  if (titles !== 1) {
    throw new Error(
      `dist/index.html contains ${titles} <title> tags, so it is not a clean Vite shell. Run "vite build" first.`,
    )
  }
  const open = template.indexOf(ROOT_OPEN)
  if (open === -1) throw new Error(`Template is missing ${ROOT_OPEN}`)
  const bodyClose = template.indexOf('</body>', open)
  if (bodyClose === -1) throw new Error('Template is missing </body>')
  const rootClose = template.lastIndexOf('</div>', bodyClose)
  if (rootClose <= open) throw new Error('Could not locate the closing </div> for #root')
  return { head: template.slice(0, open + ROOT_OPEN.length), tail: template.slice(rootClose) }
}

function setMetaTag(html, attr, key, content) {
  const pattern = new RegExp(`<meta[^>]*\\b${attr}="${key}"[^>]*>`, 'i')
  if (!pattern.test(html)) throw new Error(`Template is missing <meta ${attr}="${key}">`)
  return html.replace(pattern, `<meta ${attr}="${key}" content="${escapeHtml(content)}">`)
}

function renderHead(head, { title, description, canonical, schemas }) {
  if (!/<title>[\s\S]*?<\/title>/i.test(head)) throw new Error('Template is missing <title>')
  if (!/<link[^>]*rel="canonical"[^>]*>/i.test(head)) throw new Error('Template is missing rel="canonical"')

  let html = head
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link[^>]*rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}">`)

  html = setMetaTag(html, 'name', 'description', description)
  html = setMetaTag(html, 'property', 'og:title', title)
  html = setMetaTag(html, 'property', 'og:description', description)
  html = setMetaTag(html, 'property', 'og:url', canonical)
  html = setMetaTag(html, 'name', 'twitter:title', title)
  html = setMetaTag(html, 'name', 'twitter:description', description)

  const ld = schemas
    .map((schema) => `<script type="application/ld+json">${serializeSchema(schema)}</script>`)
    .join('')
  return html.replace('</head>', `${ld}</head>`)
}

/**
 * Per-asset crawlable markup. Deliberately replaces the homepage baseline
 * rather than appending to it: repeating the site manifesto across every asset
 * route would publish hundreds of near-duplicate pages.
 */
function renderBody(asset, profile) {
  const tags = normalizedTags(asset)
  const width = Number(asset.width_px)
  const height = Number(asset.height_px)
  const duration = Number(asset.duration_seconds)
  const thumbnail = cleanText(asset.thumbnail_url ?? asset.thumb)

  const facts = [
    ['Category', cleanText(asset.category)],
    ['Format', cleanText(asset.format)],
    ['Dimensions', width > 0 && height > 0 ? `${width} × ${height} px` : ''],
    ['Duration', duration > 0 ? `${duration} seconds` : ''],
    ['License', cleanText(asset.license)],
  ].filter(([, value]) => value)

  const factList = facts
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join('')

  const tagList = tags.length
    ? `<ul aria-label="Tags">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`
    : ''

  const media = thumbnail
    ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(profile.title)}" width="${width > 0 ? width : 640}" height="${height > 0 ? height : 360}" loading="lazy">`
    : ''

  const profileSections = profile.sections
    .map(({ heading, text }, index) => {
      const id = `${PROFILE_ID}-section-${index + 1}`
      return `<section aria-labelledby="${id}"><h3 id="${id}">${escapeHtml(heading)}</h3><p>${escapeHtml(text)}</p></section>`
    })
    .join('')

  return `
      <main>
        <nav aria-label="Breadcrumb"><ol><li><a href="/">${escapeHtml(SITE_NAME)}</a></li><li><a href="${escapeHtml(assetPathPrefix(asset))}">${escapeHtml(cleanText(asset.category, 'Assets'))}</a></li><li aria-current="page">${escapeHtml(profile.title)}</li></ol></nav>
        <article aria-labelledby="meme-title">
          <h1 id="meme-title">${escapeHtml(profile.title)}</h1>
          <p>${escapeHtml(metaDescription(asset))}</p>
          ${media}
          ${factList ? `<dl>${factList}</dl>` : ''}
          ${tagList}
          <section id="${PROFILE_ID}" aria-labelledby="${PROFILE_ID}-heading">
            <h2 id="${PROFILE_ID}-heading">${escapeHtml(profile.title)} — Meme Data Profile</h2>
            ${profileSections}
          </section>
        </article>
        <nav aria-label="Asset libraries"><ul><li><a href="/trending-memes">Trending Memes</a></li><li><a href="/gifs">Animated GIFs</a></li><li><a href="/sound-effects">Sound Effects</a></li><li><a href="/meme-templates">Meme Templates</a></li></ul></nav>
      </main>
    `
}

/** Slugs are database-derived, so the resolved path is confined to dist/. */
function resolveRouteFile(route) {
  const file = resolve(DIST, `.${route}`, 'index.html')
  if (!file.startsWith(`${DIST}/`)) throw new Error(`Unsafe output route: ${route}`)
  return file
}

function compileAssetPage({ head, tail }, asset, route) {
  const profile = generateAssetProfile(asset)
  const schemas = [
    buildMediaSchema(asset, route),
    buildBreadcrumbSchema([
      { name: SITE_NAME, url: '/' },
      { name: cleanText(asset.category, 'Assets'), url: assetPathPrefix(asset) },
      { name: profile.title },
    ]),
  ]
  const head$ = renderHead(head, {
    title: `${profile.title} — Free Download | ${SITE_NAME}`,
    description: metaDescription(asset),
    canonical: `${BASE_URL}${route}`,
    schemas,
  })
  return head$ + renderBody(asset, profile) + tail
}

/**
 * Fixed-size worker pool over `items`. Workers pull from a shared cursor, so a
 * slow item never blocks the others and only `limit` page strings are live at
 * once. Rejections are captured per item rather than aborting the pool.
 */
async function mapPool(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0

  const runner = async () => {
    while (cursor < items.length) {
      const index = cursor++
      try {
        results[index] = { ok: true, value: await worker(items[index], index) }
      } catch (cause) {
        results[index] = { ok: false, error: cause }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner))
  return results
}

export async function run() {
  const t0 = performance.now()
  dotenv.config({ path: resolve(ROOT, '.env') })
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')

  const parts = splitTemplate(await readFile(join(DIST, 'index.html'), 'utf8'))
  const tTemplate = performance.now()

  // Public anon access deliberately respects publication RLS, never service role.
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // Exactly one catalog read. '*' is deliberate: the live schema drifts from
  // schema.sql, and the JSON-LD builders in src/utils/seo.js read ~20 columns
  // under several alternative names.
  const { data, error } = await supabase
    .from('memes')
    .select('*')
    .eq('is_published', true)
    .order('id', { ascending: true })
    .range(0, MAX_ROWS - 1)
  if (error) throw new Error(`memes query failed: ${error.message}`)
  const tFetch = performance.now()

  const assets = data ?? []
  if (assets.length >= MAX_ROWS) {
    throw new Error(`Catalog read returned ${assets.length} rows and is likely truncated; paginate this query.`)
  }
  if (!assets.length) throw new Error('Catalog read returned no published assets')

  const outcomes = await mapPool(assets, CONCURRENCY, async (asset) => {
    const route = `${assetPathPrefix(asset)}/${toMemeSlug(asset)}`
    try {
      const file = resolveRouteFile(route)
      const html = compileAssetPage(parts, asset, route)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, html, 'utf8')
      return route
    } catch (cause) {
      throw new Error(`${route} - ${cause.message}`)
    }
  })
  const tWrite = performance.now()

  const failures = outcomes.filter((outcome) => !outcome.ok)
  const written = outcomes.length - failures.length
  const ms = (value) => `${Math.round(value)}ms`

  console.log(
    `✓ Hyper-Fast In-Memory Engine: Compiled ${written} static content layers in ${ms(tWrite - t0)}\n` +
      `  template ${ms(tTemplate - t0)} · fetch ${ms(tFetch - tTemplate)} · compile+write ${ms(tWrite - tFetch)}` +
      ` · ${assets.length} rows · concurrency ${CONCURRENCY}`,
  )

  if (failures.length) {
    for (const failure of failures) console.error(`  FAIL  ${failure.error.message}`)
    throw new Error(`${failures.length} of ${outcomes.length} routes failed to compile`)
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  run().catch((error) => {
    console.error('[prerender] Fatal error:', error.message)
    process.exitCode = 1
  })
}
