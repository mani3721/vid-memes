export const AD_ORIGIN = 'https://bellnewyork.org'

export const BANNER_UNITS = {
  leaderboard: { key: '028d4bc3ddd4b9f13e457b721a8619a5', width: 728, height: 90 },
  banner: { key: '9a08e5c2bb7b9a29dbc427355168adc1', width: 468, height: 60 },
  mobile: { key: '3356366a24ae8e3e69035e45bad35876', width: 320, height: 50 },
  rectangle: { key: '6559979a533b8e373ce6d2c68867a775', width: 300, height: 250 },
  skyscraper: { key: 'a9380238aaa77035f100bdf6bb3dcb17', width: 160, height: 600 },
  shortSkyscraper: { key: 'd3befb618e281017f3ac9762c818e6bf', width: 160, height: 300 },
}

// Measure the panel, not the viewport: the navigation rail and padding also
// consume space. Never squeeze a fixed-size creative or load hidden variants.
export function selectBannerUnit(format, width) {
  const names = format === 'skyscraper'
    ? ['skyscraper']
    : format === 'short-skyscraper'
      ? ['shortSkyscraper']
      : format === 'rectangle'
        ? ['rectangle']
        : ['leaderboard', 'banner', 'mobile', 'rectangle']
  return names.map((name) => BANNER_UNITS[name]).find((unit) => unit.width <= width) ?? null
}

// Each creative gets its own document because provider tags may document.write
// and all use the same global atOptions variable.
export function bannerDocument(unit) {
  const options = { ...unit, format: 'iframe', params: {} }
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>var atOptions = ${JSON.stringify(options)};</script><script src="${AD_ORIGIN}/22/${unit.key}"></script></body></html>`
}
