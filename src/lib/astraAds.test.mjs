import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

const root = new URL('../../', import.meta.url)
const source = (path) => readFile(new URL(path, root), 'utf8')

async function sourceFiles(directory) {
  const entries = await readdir(new URL(directory, root), { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => {
    const path = `${directory}/${entry.name}`
    return entry.isDirectory() ? sourceFiles(path) : /\.(js|jsx)$/.test(entry.name) ? [path] : []
  }))
  return files.flat()
}

test('Adsterra URLs and loaders are absent from HTML and application sources', async () => {
  const paths = ['index.html', ...await sourceFiles('src')]
  for (const path of paths) {
    assert.doesNotMatch(await source(path), /accountut\.com|bellnewyork\.org|astraAds|AstraAd|astraLoaded|provider=["']astra["']/i, path)
  }
})

test('Google AdSense, analytics, and application entry point are preserved', async () => {
  const html = await source('index.html')
  assert.match(html, /https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/)
  assert.match(html, /https:\/\/www\.googletagmanager\.com\/gtag\/js/)
  assert.match(html, /<script type="module" src="\/src\/main\.jsx"><\/script>/)
  const slot = await source('src/components/AdSlot.jsx')
  assert.ok(slot.includes('auditPlacement(el, context)'))
  assert.ok(slot.includes('loadAdSense(ADSENSE_CLIENT)'))
  assert.ok(slot.includes('!ADSENSE_CLIENT || failed'))
})
