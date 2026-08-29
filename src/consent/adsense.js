/**
 * Loads the AdSense tag exactly once, and only when called. Nothing in this
 * module runs at import time — the script is injected on the first AdSlot
 * render that happens *after* consent is granted.
 */
let loader = null

export function loadAdSense(clientId) {
  if (loader) return loader
  if (!clientId) return Promise.reject(new Error('Missing AdSense client ID'))

  loader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-adsense-loader]')
    if (existing) return resolve()

    const script = document.createElement('script')
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.adsenseLoader = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('AdSense script failed to load'))
    document.head.appendChild(script)
  })

  return loader
}

/** Hands a rendered <ins> element to AdSense. Safe to call once per slot. */
export function fillSlot() {
  window.adsbygoogle = window.adsbygoogle || []
  window.adsbygoogle.push({})
}
