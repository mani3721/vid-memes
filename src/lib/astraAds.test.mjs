import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { BANNER_UNITS, bannerDocument, selectBannerUnit } from './astraAds.js'

const source = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('document-wide Adsterra tag loads once at the end of the static head', async () => {
  const html = await source('../../index.html')
  const url = 'https://accountut.com/1/676953c0ba8ce919e0b2078e105e7c04'
  assert.equal(html.split(url).length - 1, 1)
  assert.ok(html.includes(`<script data-cfasync="false" src="${url}"></script>\n  </head>`))
  const component = await source('../components/AstraAd.jsx')
  assert.ok(!component.includes('accountut.com'))
  assert.ok(!component.includes('mountDocumentScript'))
})

test('native banner loads once in the body outside the React root', async () => {
  const html = await source('../../index.html')
  const url = 'https://bellnewyork.org/21/e711522f5deae38d82fdd9441db23d41'
  const container = 'container-e711522f5deae38d82fdd9441db23d41'
  assert.equal(html.split(url).length - 1, 1)
  assert.equal(html.split(`id="${container}"`).length - 1, 1)
  const snippet = `<script async="async" data-cfasync="false" src="${url}"></script>\n      <div id="${container}"></div>`
  assert.ok(html.includes(snippet))
  const bannerStart = html.indexOf(snippet)
  assert.ok(bannerStart > html.indexOf('<body>'))
  assert.ok(bannerStart < html.indexOf('</body>'))
  const rootEnd = html.lastIndexOf('</div>', bannerStart)
  assert.match(html.slice(rootEnd, bannerStart), /^<\/div>\s*<!--[^]*?-->\s*<section[^>]*>\s*$/)
})

test('saved cookie choices do not gate ads and no cookie prompt is mounted', async () => {
  const [slot, shell, main] = await Promise.all([
    source('../components/AdSlot.jsx'),
    source('../components/AppShell.jsx'),
    source('../main.jsx'),
  ])
  assert.ok(!slot.includes('useConsent'))
  assert.ok(slot.includes('const adsAllowed = true'))
  assert.ok(slot.includes('auditPlacement(el, context)'))
  assert.ok(!shell.includes('CookieBanner'))
  assert.ok(!main.includes('ConsentProvider'))
})

test('responsive banners use the actual panel width', () => {
  for (const [width, name] of [[1100, 'leaderboard'], [728, 'leaderboard'], [727, 'banner'], [468, 'banner'], [467, 'mobile'], [320, 'mobile'], [319, 'rectangle'], [300, 'rectangle']]) {
    assert.equal(selectBannerUnit('banner', width), BANNER_UNITS[name])
  }
  assert.equal(selectBannerUnit('banner', 299), null)
})

test('article and sidebar formats use matching dimensions without overflow', () => {
  for (const [format, name] of [['rectangle', 'rectangle'], ['skyscraper', 'skyscraper'], ['short-skyscraper', 'shortSkyscraper']]) {
    const unit = BANNER_UNITS[name]
    assert.equal(selectBannerUnit(format, unit.width), unit)
    assert.equal(selectBannerUnit(format, unit.width - 1), null)
  }
})

test('all six isolated creatives have valid separate script tags', () => {
  assert.equal(Object.keys(BANNER_UNITS).length, 6)
  for (const unit of Object.values(BANNER_UNITS)) {
    const html = bannerDocument(unit)
    assert.ok(html.includes(`"key":"${unit.key}"`))
    assert.ok(html.includes(`"width":${unit.width}`))
    assert.ok(html.includes(`"height":${unit.height}`))
    assert.ok(html.includes(`</script><script src="https://bellnewyork.org/22/${unit.key}"></script>`))
    assert.equal((html.match(/<script/g) ?? []).length, 2)
  }
})
