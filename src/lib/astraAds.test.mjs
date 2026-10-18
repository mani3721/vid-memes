import test from 'node:test'
import assert from 'node:assert/strict'
import { BANNER_UNITS, bannerDocument, selectBannerUnit } from './astraAds.js'

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
