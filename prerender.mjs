#!/usr/bin/env node
/**
 * Real (headless-browser) prerenderer for Videsaur, run as part of `npm run
 * build` so it actually reaches production.
 *
 * Serves dist/, loads every indexable route in headless Chromium, waits for
 * the SPA to render, and writes the resulting post-JS HTML back into
 * dist/<route>/index.html. This produces real per-route content — the thing
 * an AdSense/Googlebot crawl needs to see without running JS.
 *
 * Lives inside the client repo (not a sibling scripts/ or server/ directory)
 * on purpose: this is the only thing Vercel's build actually checks out, so
 * the route list and slug/URL logic below are duplicated from
 * server/lib/sitemap/{config,urls}.js rather than imported — the same
 * constraint already documented in src/utils/seo.js ("client/ and server/
 * are separate git repos with separate deploys and no shared package").
 * Keep STATIC_ROUTES in sync with server/lib/sitemap/config.js's
 * STATIC_PAGES by hand if routes change.
 *
 * Requires (added to package.json): playwright, serve-handler, dotenv.
 * Needs VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — already required at
 * runtime for the app itself, so these should already be set in Vercel's
 * project environment variables; dotenv.config() below is only for local
 * `.env` convenience and no-ops if the file isn't present.
 */

import { chromium } from 'playwright'
import { createServer } from 'http'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import handler from 'serve-handler'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { toMemeSlug, assetPathPrefix } from './src/utils/seo.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '')

dotenv.config({ path: resolve(__dirname, '.env') })

const DIST = resolve(__dirname, 'dist')
const PORT = 5173

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[prerender] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.')
  process.exit(1)
}

// Anon key on purpose: it carries the same RLS-gated view of the data the
// real site (and a crawler) sees, so this never bakes in unpublished rows.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Mirrors server/lib/sitemap/config.js's STATIC_PAGES paths (minus '/help',
 * which has no matching <Route> in src/App.jsx — see the note in that file).
 */
const STATIC_ROUTES = [
  '/',
  '/trending',
  '/videos',
  '/gifs',
  '/templates',
  '/sounds',
  '/ai-sound',
  '/ai-chat',
  '/blog',
  '/about',
  '/contact',
  '/content-policy',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/cookie-policy',
]

function toMemePath(meme) {
  return `${assetPathPrefix(meme)}/${toMemeSlug(meme)}`
}

function routeToFile(route) {
  if (route === '/') return join(DIST, 'index.html')
  const dir = join(DIST, route)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'index.html')
}

function startServer() {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) =>
      handler(req, res, {
        public: DIST,
        rewrites: [{ source: '**', destination: '/index.html' }],
        headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'no-store' }] }],
      }),
    )
    server.listen(PORT, () => resolvePromise(server))
  })
}

/** Every published meme/sound detail page, plus every published blog post. */
async function getDynamicRoutes() {
  console.log('[prerender] Fetching published asset and blog slugs from Supabase...')

  const { data: memes, error: memesError } = await supabase
    .from('memes')
    .select('id, title, category')
    .eq('is_published', true)
  if (memesError) throw new Error(`memes query failed: ${memesError.message}`)

  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  if (postsError) throw new Error(`blog_posts query failed: ${postsError.message}`)

  return [...(memes ?? []).map(toMemePath), ...(posts ?? []).map((p) => `/blog/${p.slug}`)]
}

async function run() {
  const indexFile = join(DIST, 'index.html')
  if (!existsSync(indexFile)) {
    console.error(`[prerender] ${indexFile} not found. Run \`vite build\` first.`)
    process.exit(1)
  }

  const dynamicRoutes = await getDynamicRoutes()
  const ALL_ROUTES = [...STATIC_ROUTES, ...dynamicRoutes]

  console.log(`[prerender] Found ${ALL_ROUTES.length} total pages to bake into static HTML.`)
  console.log(`[prerender] Starting static deployment server on :${PORT}...`)
  const server = await startServer()

  console.log('[prerender] Launching Chromium...')
  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent: 'Mediapartners-Google prerender/1.0',
    javaScriptEnabled: true,
  })

  let passed = 0
  let failed = 0

  for (const route of ALL_ROUTES) {
    const url = `http://localhost:${PORT}${route}`
    const outFile = routeToFile(route)
    const page = await context.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })

      // Wait for React to hydrate and replace the loading state with real content.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root')
          return root && root.children.length > 0 && !document.body.innerText.includes('Loading')
        },
        { timeout: 15_000 },
      )

      const html = await page.content()
      writeFileSync(outFile, html, 'utf8')
      console.log(`  ok    ${route}  ->  ${outFile.replace(DIST, 'dist')}`)
      passed++
    } catch (err) {
      console.error(`  FAIL  ${route}  - ${err.message}`)
      failed++
    } finally {
      await page.close()
    }
  }

  await browser.close()
  server.close()

  console.log(`\n[prerender] Done — ${passed} pages compiled successfully, ${failed} failed.`)
  if (failed) process.exit(1)
}

run().catch((err) => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
