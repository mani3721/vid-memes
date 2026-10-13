#!/usr/bin/env node
/**
 * Render published routes with Chromium and add visible, metadata-grounded
 * editing profiles to asset pages. Run after Vite via `npm run build`.
 *
 * These profiles are editorial guidance, not verified histories of the clips.
 * Metadata alone cannot guarantee unique reporting, search rankings, AdSense
 * approval, ownership, public-domain status, or a fair-use determination.
 * Keep STATIC_ROUTES aligned with the independently deployed server sitemap.
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import handler from 'serve-handler'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { toMemeSlug, assetPathPrefix } from './src/utils/seo.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(ROOT, 'dist')
const PROFILE_ID = 'videsaur-asset-data-profile'
const PAGE_SIZE = 500

const STATIC_ROUTES = [
  '/', '/trending', '/trending-memes', '/videos', '/gifs', '/templates',
  '/meme-templates', '/sounds', '/sound-effects', '/ai-sound', '/ai-chat',
  '/blog', '/about', '/about-us', '/contact', '/contact-us', '/content-policy',
  '/dmca-policy', '/privacy', '/privacy-policy', '/terms',
  '/terms-and-conditions', '/disclaimer', '/cookie-policy',
]

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

/** Use the browser's HTML parser and text nodes, never unescaped DB markup. */
export async function injectAssetProfile(page, asset) {
  const profile = generateAssetProfile(asset)
  await page.evaluate(({ profile, profileId }) => {
    const article = document.querySelector('article[aria-labelledby="meme-title"]')
    const primaryBlock = article?.firstElementChild
    if (!primaryBlock?.querySelector('video, audio, img')) {
      throw new Error('Primary asset media block was not rendered')
    }
    document.getElementById(profileId)?.remove()
    const section = document.createElement('section')
    section.id = profileId
    section.setAttribute('aria-labelledby', `${profileId}-heading`)
    section.className = 'mt-8 rounded-2xl border border-edge bg-panel p-6'
    const heading = document.createElement('h2')
    heading.id = `${profileId}-heading`
    heading.className = 'mb-6 font-display text-xl text-hi'
    heading.textContent = `${profile.title} — Meme Data Profile`
    section.append(heading)
    const grid = document.createElement('div')
    grid.className = 'grid gap-6'
    for (const [index, entry] of profile.sections.entries()) {
      const block = document.createElement('section')
      const subheading = document.createElement('h3')
      subheading.id = `${profileId}-section-${index + 1}`
      subheading.className = 'mb-2 text-base font-semibold text-hi'
      subheading.textContent = entry.heading
      block.setAttribute('aria-labelledby', subheading.id)
      const paragraph = document.createElement('p')
      paragraph.className = 'text-sm leading-relaxed text-mid'
      paragraph.textContent = entry.text
      block.append(subheading, paragraph)
      grid.append(block)
    }
    section.append(grid)
    // Beneath the complete player/details grid, without disturbing its columns.
    primaryBlock.after(section)
  }, { profile, profileId: PROFILE_ID })
}

async function fetchPublishedRows(supabase, table, column, value) {
  const rows = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    // '*' supports both mood_tags-only schemas and rows with additional tags.
    const { data, error } = await supabase.from(table).select('*')
      .eq(column, value).order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error(`${table} query failed: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

async function getDynamicRoutes(supabase) {
  const [memes, posts] = await Promise.all([
    fetchPublishedRows(supabase, 'memes', 'is_published', true),
    fetchPublishedRows(supabase, 'blog_posts', 'status', 'published'),
  ])
  return [
    ...memes.map((asset) => ({
      route: `${assetPathPrefix(asset)}/${toMemeSlug(asset)}`, asset,
    })),
    ...posts.filter((post) => cleanText(post.slug)).map((post) => ({
      route: `/blog/${encodeURIComponent(post.slug)}`, asset: null,
    })),
  ]
}

function routeToFile(route) {
  const file = resolve(DIST, `.${route}`, 'index.html')
  if (!file.startsWith(`${DIST}/`)) throw new Error(`Unsafe output route: ${route}`)
  mkdirSync(dirname(file), { recursive: true })
  return file
}

/**
 * Vercel's build image has no Chromium system libraries and no root to install
 * them, so there we drive the Lambda build that bundles its own. Everywhere
 * else Playwright's locally installed browser is used.
 *
 * `--single-process` is dropped: it suits Puppeteer but starves Playwright,
 * which needs out-of-process renderers and otherwise reports a closed target.
 */
async function launchBrowser() {
  if (!process.env.VERCEL) return chromium.launch()

  const { default: lambdaChromium } = await import('@sparticuz/chromium')
  const args = lambdaChromium.args.filter(
    (arg) => arg !== '--single-process' && !arg.startsWith('--headless'),
  )
  return chromium.launch({
    executablePath: await lambdaChromium.executablePath(),
    args,
  })
}

async function startServer(template) {
  const server = createServer((req, res) => {
    // Every navigation gets the immutable Vite shell, not a previously baked
    // route. Otherwise rendering '/' first contaminates subsequent SPA loads.
    if (req.headers.accept?.includes('text/html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(template)
      return
    }
    Promise.resolve(handler(req, res, { public: DIST })).catch((error) => {
      console.error('[prerender] Static server error:', error.message)
      if (!res.headersSent) res.writeHead(500)
      res.end()
    })
  })
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolvePromise)
  })
  return server
}

export async function run() {
  dotenv.config({ path: resolve(ROOT, '.env') })
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  const indexFile = join(DIST, 'index.html')
  if (!existsSync(indexFile)) throw new Error('dist/index.html not found. Run vite build first.')
  const template = readFileSync(indexFile, 'utf8')
  // Public anon access deliberately respects publication RLS, never service role.
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const dynamic = await getDynamicRoutes(supabase)
  const routes = [...new Map([
    ...STATIC_ROUTES.map((route) => [route, { route, asset: null }]),
    ...dynamic.map((entry) => [entry.route, entry]),
  ]).values()]
  console.log(`[prerender] Rendering ${routes.length} routes, including ${dynamic.filter((entry) => entry.asset).length} asset profiles.`)
  const server = await startServer(template)
  const origin = `http://127.0.0.1:${server.address().port}`
  let browser
  let passed = 0
  let failed = 0
  try {
    browser = await launchBrowser()
    // Normal browser identity: the content is not conditional on crawler UA.
    const context = await browser.newContext({ javaScriptEnabled: true })
    for (const { route, asset } of routes) {
      const page = await context.newPage()
      try {
        await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        await page.waitForFunction(() => {
          const root = document.getElementById('root')
          return root && root.children.length > 0 && root.querySelector('h1') &&
            !root.querySelector('[aria-busy="true"]') &&
            !/^Loading[.\s…]*$/u.test(root.innerText.trim())
        }, null, { timeout: 30_000 })
        if (asset) {
          await page.waitForSelector('article[aria-labelledby="meme-title"]', { timeout: 30_000 })
          if (new URL(page.url()).pathname !== route) throw new Error('Asset redirected away from its canonical route')
          await injectAssetProfile(page, asset)
        }
        // Browser serialization escapes all generated text and retains SEO markup.
        writeFileSync(routeToFile(route), await page.content(), 'utf8')
        passed++
        console.log(`  ok    ${route}`)
      } catch (error) {
        failed++
        console.error(`  FAIL  ${route} - ${error.message}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    try {
      if (browser) await browser.close()
    } finally {
      await new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()))
    }
  }
  console.log(`[prerender] Done: ${passed} pages rendered, ${failed} failed.`)
  if (failed) throw new Error(`${failed} routes failed to prerender`)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  run().catch((error) => {
    console.error('[prerender] Fatal error:', error.message)
    process.exitCode = 1
  })
}
