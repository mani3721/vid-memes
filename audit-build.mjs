#!/usr/bin/env node
/**
 * Local pre-submission audit. Run after `npm run build`:
 *
 *   npm run audit
 *
 * Proves the "JavaScript Wall" is broken in the built output — that every page
 * an AdSense or Googlebot crawler can reach already carries readable text in
 * the raw HTML, before any JavaScript executes.
 *
 * This inspects dist/ only. It cannot speak to what the live origin serves:
 * routing, redirects, and CDN behaviour are verified separately in Search
 * Console. A green run here is a necessary condition for approval, never a
 * sufficient one.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(ROOT, 'dist')

/** Must match public/ads.txt byte-for-byte after trimming. */
const ADS_TXT_RECORD = 'google.com, pub-2535160931599447, DIRECT, f08c47fec0942fa0'

/** The 12 routes required by the prerender contract, plus shipped aliases. */
const CORE_ROUTES = [
  '/', '/about', '/contact', '/privacy-policy', '/terms-of-use', '/dmca-policy',
  '/cookie-policy', '/platform-disclaimer', '/trending-memes', '/animated-gifs',
  '/sound-effects', '/meme-templates',
]

/** Detail pages live under these prefixes (see assetPathPrefix in src/utils/seo.js). */
const ASSET_DIRS = ['meme', 'sound']

/** The rich text container the asset compiler emits on every detail page. */
const PROFILE_ID = 'videsaur-asset-data-profile'

/**
 * Two different questions, two different thresholds.
 *
 * MIN_WORDS_* is the hard floor: "did prerendering happen at all?" An unrendered
 * SPA shell yields ~0 words, so anything above this floor proves the JavaScript
 * Wall is broken. Failing it blocks the build.
 *
 * THIN_CONTENT_WORDS is advisory: "would a reviewer call this page thin?" Some
 * pages — a contact form, for instance — are legitimately short, so this reports
 * a warning for judgement rather than failing. Conflating the two would either
 * hide real empty pages or block on pages that are fine.
 */
const MIN_WORDS_CORE = 60
const MIN_WORDS_ASSET = 250
const THIN_CONTENT_WORDS = 250

/** Vite emits fingerprinted bundles here; a page that references none is broken. */
const ASSET_HREF = /\b(?:src|href)="\/assets\/[^"]+"/

/**
 * Injected by prerender.mjs into every structural page it writes.
 *
 * This check matters more than it looks. The Vite shell in index.html already
 * ships ~885 words of homepage manifesto copy as a crawlable baseline, so a
 * word count alone cannot tell a correctly prerendered /about from a stale
 * shell copied into dist/about/index.html — both look content-rich. The marker
 * is the only reliable signal that route-specific content was substituted.
 */
const PRERENDER_MARKER = '<!-- videsaur-prerendered -->'

const failures = []
const warnings = []
const notes = []

function fail(scope, message) {
  failures.push(`${scope}: ${message}`)
}

function warn(scope, message) {
  warnings.push(`${scope}: ${message}`)
}

async function readIfPresent(file) {
  try {
    return await readFile(file, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

/**
 * Crawler-visible body text. Strips <head> entirely, then script, style and
 * noscript blocks, then all remaining tags and entities. Deliberately plain
 * string/regex work — no DOM parser, so the audit has zero dependencies and
 * sees the bytes a crawler receives rather than a normalized tree.
 */
function visibleWords(html) {
  const bodyAt = html.indexOf('<body')
  const body = bodyAt === -1 ? html : html.slice(bodyAt)
  const text = body
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text ? text.split(' ').length : 0
}

/**
 * Inner HTML of the element carrying `id`, counting nested tags of the same
 * name. A non-greedy regex cannot do this: the asset profile is a <section>
 * containing one <section> per subsection, so `([\s\S]*?)</section>` would stop
 * at the first inner close and under-count the text by roughly half.
 */
function extractElement(html, id) {
  const open = new RegExp(`<([a-z]+)\\b[^>]*\\bid="${id}"[^>]*>`, 'i').exec(html)
  if (!open) return null
  const tag = open[1].toLowerCase()
  const scanner = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, 'gi')
  scanner.lastIndex = open.index + open[0].length
  let depth = 1
  let match
  while ((match = scanner.exec(html)) !== null) {
    if (match[2] === '/') continue // self-closing, no depth change
    depth += match[1] === '/' ? -1 : 1
    if (depth === 0) return html.slice(open.index + open[0].length, match.index)
  }
  return null // unbalanced markup
}

function routeToFile(route) {
  return route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html')
}

/** Shared structural checks applied to every page the audit opens. */
function checkPage(scope, html, minWords) {
  const words = visibleWords(html)
  if (words < minWords) {
    fail(scope, `only ${words} words of crawlable body text (need >= ${minWords}) — JavaScript Wall not broken`)
  }
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  if (!title) fail(scope, 'no <title> tag')
  else if (!title[1].trim()) fail(scope, '<title> is empty')
  else if ((html.match(/<title\b/gi) ?? []).length > 1) fail(scope, 'more than one <title> tag')

  if (!/<h1[\s>]/i.test(html)) fail(scope, 'no <h1> heading')
  if (!/<link\b[^>]*\brel="canonical"/i.test(html)) fail(scope, 'no rel="canonical" link')
  if (!ASSET_HREF.test(html)) fail(scope, 'references no /assets/ bundle — stylesheets or JS chunks will not load')
  if (/\b(?:src|href)="\.\/assets\//.test(html)) {
    fail(scope, 'contains relative ./assets/ paths, which break on nested routes')
  }
  return words
}

async function auditCoreRoutes() {
  let lowest = Infinity
  let lowestRoute = ''
  const titles = new Map()
  for (const route of CORE_ROUTES) {
    const file = routeToFile(route)
    const html = await readIfPresent(file)
    if (html === null) {
      fail(route, `missing ${file.replace(`${DIST}/`, 'dist/')} — directory-style output not generated`)
      continue
    }
    const words = checkPage(route, html, MIN_WORDS_CORE)
    if (!html.includes(PRERENDER_MARKER)) {
      fail(route, 'no prerender marker — this is the unmodified Vite shell, not route-specific content')
    }
    if (words >= MIN_WORDS_CORE && words < THIN_CONTENT_WORDS) {
      warn(route, `${words} words of body text — prerendered correctly, but a reviewer may read this as thin content (guideline: ${THIN_CONTENT_WORDS}+)`)
    }
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
    if (title) {
      const seen = titles.get(title)
      if (seen) fail(route, `shares its <title> with ${seen} ("${title}") — duplicate titles read as duplicate pages`)
      else titles.set(title, route)
    }
    if (words < lowest) {
      lowest = words
      lowestRoute = route
    }
  }
  if (lowestRoute) notes.push(`core routes: ${CORE_ROUTES.length} checked, thinnest is ${lowestRoute} at ${lowest} words`)
}

async function listAssetRoutes() {
  const routes = []
  for (const base of ASSET_DIRS) {
    let entries
    try {
      entries = await readdir(join(DIST, base), { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }
    for (const entry of entries) {
      if (entry.isDirectory()) routes.push(`/${base}/${entry.name}`)
    }
  }
  return routes
}

async function auditAssetRoutes() {
  const routes = await listAssetRoutes()
  if (!routes.length) {
    fail('asset pages', `no subfolders under dist/${ASSET_DIRS.join('/ or dist/')}/ — did the build run with PRERENDER_ASSETS=0 or without Supabase credentials?`)
    return
  }
  let lowest = Infinity
  let lowestRoute = ''
  for (const route of routes) {
    const html = await readIfPresent(join(DIST, route.slice(1), 'index.html'))
    if (html === null) {
      fail(route, 'directory exists but holds no index.html')
      continue
    }
    const words = checkPage(route, html, MIN_WORDS_ASSET)

    // The data profile is the per-asset unique copy. Its absence means the page
    // fell back to the shell and would read as thin content.
    const container = extractElement(html, PROFILE_ID)
    if (container === null) {
      fail(route, `no element with id="${PROFILE_ID}" (or its markup is unbalanced)`)
    } else {
      const inner = visibleWords(`<body>${container}`)
      if (inner < MIN_WORDS_ASSET) {
        fail(route, `id="${PROFILE_ID}" holds only ${inner} words (need >= ${MIN_WORDS_ASSET})`)
      }
    }
    if (words < lowest) {
      lowest = words
      lowestRoute = route
    }
  }
  if (lowestRoute) notes.push(`asset pages: ${routes.length} checked, thinnest is ${lowestRoute} at ${lowest} words`)
}

async function auditAdsTxt() {
  const file = join(DIST, 'ads.txt')
  const contents = await readIfPresent(file)
  if (contents === null) {
    fail('ads.txt', 'dist/ads.txt is missing — copy it into public/ so Vite emits it')
    return
  }
  const lines = contents.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.includes(ADS_TXT_RECORD)) {
    fail('ads.txt', `publisher record not found. Expected exactly:\n    ${ADS_TXT_RECORD}\n  Found:\n${lines.map((line) => `    ${line}`).join('\n') || '    (file is empty)'}`)
    return
  }
  notes.push(`ads.txt: publisher record present (${lines.length} record${lines.length === 1 ? '' : 's'} total)`)
}

async function auditBuildArtifacts() {
  // These are build intermediates. They are 404'd in vercel.json, but a stray
  // copy in dist/ still signals a half-finished build.
  for (const name of ['prerender-pages.json', '.prerender-template.html']) {
    try {
      await stat(join(DIST, name))
    } catch {
      fail('build', `dist/${name} is missing — prerender.mjs did not complete`)
    }
  }
}

async function main() {
  try {
    await stat(DIST)
  } catch {
    console.error('✗ dist/ does not exist. Run `npm run build` first.')
    process.exitCode = 1
    return
  }

  await auditBuildArtifacts()
  await auditCoreRoutes()
  await auditAssetRoutes()
  await auditAdsTxt()

  for (const note of notes) console.log(`  ${note}`)

  if (warnings.length) {
    console.warn(`\n⚠ ${warnings.length} advisory warning${warnings.length === 1 ? '' : 's'} (do not block the build):\n`)
    for (const warning of warnings) console.warn(`  • ${warning}`)
  }

  if (failures.length) {
    console.error(`\n✗ Build audit failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:\n`)
    for (const failure of failures) console.error(`  • ${failure}`)
    console.error('\nFix these before resubmitting to AdSense.')
    process.exitCode = 1
    return
  }
  console.log('\n✓ Build audit passed. dist/ is crawlable; verify the live origin in Search Console before resubmitting.')
}

main().catch((error) => {
  console.error('✗ Audit crashed:', error.message)
  process.exitCode = 1
})
