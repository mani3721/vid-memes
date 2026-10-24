#!/usr/bin/env node
/**
 * Build-time HTML injection. No browser or rendering dependencies here: Vite
 * supplies a content manifest rendered from the real React page components.
 * Run `npm run build`; `npm run prerender` can safely repeat the injection.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(ROOT, 'dist')
const REQUIRED_ROUTES = [
  '/', '/about', '/contact', '/privacy-policy', '/terms-of-use', '/dmca-policy',
  '/cookie-policy', '/platform-disclaimer', '/trending-memes', '/animated-gifs',
  '/sound-effects', '/meme-templates',
]
const MARKER = '<!-- videsaur-prerendered -->'
const SNAPSHOT = resolve(DIST, '.prerender-template.html')
const ROOT_PATTERN = /(<div\b[^>]*\bid=["']root["'][^>]*>)([\s\S]*)(<\/div>\s*(?:<script\b[^>]*>[\s\S]*?<\/script>\s*)*<\/body>)/i

export function routeFile(route, dist = DIST) {
  if (!/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(route)) {
    throw new Error(`Invalid static route: ${route}`)
  }
  const file = resolve(dist, `.${route}`, 'index.html')
  if (!file.startsWith(`${resolve(dist)}${sep}`)) throw new Error(`Unsafe static route: ${route}`)
  return file
}

/** Root-relative URLs work on every nested route and Vercel preview domain. */
export function normalizeAssets(html) {
  return html.replace(/\b(src|href)=(['"])(?:\.\/)?assets\//gi, '$1=$2/assets/')
}

/** React 19 hoists page metadata. Move it to the template head, replacing
 * matching shell metadata rather than emitting conflicting canonical tags.
 */
export function compilePage(template, rendered) {
  if (!ROOT_PATTERN.test(template)) throw new Error('Cannot locate the #root wrapper in dist/index.html')
  const metadata = []
  const body = rendered.replace(/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*\brel="canonical"[^>]*>/gi, (tag) => {
    metadata.push(tag)
    return ''
  })
  if (!body.includes('<h1') || !metadata.some((tag) => tag.startsWith('<title>'))) {
    throw new Error('Rendered page must contain a title and an h1')
  }
  const boundary = template.indexOf('</head>')
  if (boundary === -1) throw new Error('Template is missing </head>')
  let head = template.slice(0, boundary)
  for (const tag of metadata) {
    if (tag.startsWith('<title>')) {
      head = head.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    } else if (tag.startsWith('<link')) {
      head = head.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '')
    } else {
      const identity = tag.match(/\b(name|property)="([^"]+)"/i)
      if (identity) {
        const key = identity[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        head = head.replace(new RegExp(`<meta\\b[^>]*\\b${identity[1]}=["']${key}["'][^>]*>`, 'gi'), '')
      }
    }
  }
  // Callback replacement is essential: authored text may contain literal $&.
  const shell = `${head}${metadata.join('\n')}\n${template.slice(boundary)}`
  return normalizeAssets(shell.replace(ROOT_PATTERN, (_, open, _oldBody, tail) => `${open}${MARKER}${body}${tail}`))
}

export async function run() {
  let template
  try {
    template = await readFile(resolve(DIST, 'index.html'), 'utf8')
  } catch (cause) {
    throw new Error('Missing dist/index.html. Run npm run build first.', { cause })
  }
  if (template.includes(MARKER)) {
    template = await readFile(SNAPSHOT, 'utf8')
  }
  const pages = JSON.parse(await readFile(resolve(DIST, 'prerender-pages.json'), 'utf8'))
  if (!Array.isArray(pages)) throw new Error('Invalid page manifest; run npm run build again')
  const routes = new Set(pages.map(({ route }) => route))
  for (const route of REQUIRED_ROUTES) {
    if (!routes.has(route)) throw new Error(`Page manifest is missing ${route}`)
  }
  if (routes.size !== pages.length) throw new Error('Duplicate routes in page manifest')
  // Validate every page before changing the build output.
  const output = pages.map(({ route, html }) => ({ file: routeFile(route), html: compilePage(template, html) }))
  await writeFile(SNAPSHOT, template, 'utf8')

  // Preserve the original asset compiler. Public anonymous credentials only;
  // never use a service-role key for published catalog prerendering.
  try {
    process.loadEnvFile?.(resolve(ROOT, '.env'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const mode = process.env.PRERENDER_ASSETS ?? 'auto'
  if (!['auto', '0', '1'].includes(mode)) throw new Error('PRERENDER_ASSETS must be auto, 0, or 1')
  const hasCatalog = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
  if (mode === '1' || (mode === 'auto' && hasCatalog)) {
    // The asset compiler must read the original Vite shell, not a rendered home.
    await writeFile(resolve(DIST, 'index.html'), template, 'utf8')
    const { run: renderAssets } = await import('./prerender-assets.mjs')
    await renderAssets()
  } else {
    console.log('[prerender] Individual assets skipped; structural pages do not require an API.')
  }

  await Promise.all(output.map(async ({ file, html }) => {
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html, 'utf8')
  }))
  console.log(`[prerender] Wrote ${output.length} static pages, including all ${REQUIRED_ROUTES.length} required routes.`)
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  run().catch((error) => {
    console.error('[prerender]', error.message)
    process.exitCode = 1
  })
}
