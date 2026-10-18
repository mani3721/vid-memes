import { useCallback, useState } from 'react'
import { AD_ORIGIN, bannerDocument, selectBannerUnit } from '../lib/astraAds'

const NATIVE_KEY = 'e711522f5deae38d82fdd9441db23d41'
const POPUNDER_URL = 'https://accountut.com/1/676953c0ba8ce919e0b2078e105e7c04'

/** Render only inside a consent-gated, placement-audited AdSlot. */
export default function AstraAd({ format }) {
  const [unit, setUnit] = useState(null)
  const measure = useCallback((container) => {
    if (!container) return undefined
    const update = () => {
      const next = selectBannerUnit(format, container.clientWidth)
      setUnit((current) => current?.key === next?.key ? current : next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    return () => observer.disconnect()
  }, [format])

  const mountNative = useCallback((container) => {
    // Ref callbacks replay in StrictMode; the node marker prevents duplicates.
    if (!container || container.dataset.astraLoaded) return
    container.dataset.astraLoaded = 'true'
    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src = `${AD_ORIGIN}/21/${NATIVE_KEY}`
    container.appendChild(script)
  }, [])

  const mountDocumentScript = useCallback((container) => {
    if (!container || document.getElementById('astra-document-script')) return
    // This is a separate document-wide tag, never nested inside atOptions.
    // Keep its marker across SPA navigation to avoid duplicate handlers.
    const script = document.createElement('script')
    script.id = 'astra-document-script'
    script.setAttribute('data-cfasync', 'false')
    script.src = POPUNDER_URL
    document.body.appendChild(script)
  }, [])

  return (
    <div ref={mountDocumentScript}>
      {format === 'native' ? (
        <div id={`container-${NATIVE_KEY}`} ref={mountNative} className="min-h-24" />
      ) : (
        <div ref={measure} className="w-full overflow-hidden">
          {unit && (
            <iframe
              key={unit.key}
              title="Advertisement banner"
              srcDoc={bannerDocument(unit)}
              width={unit.width}
              height={unit.height}
              sandbox="allow-scripts allow-popups allow-forms"
              className="mx-auto block border-0"
            />
          )}
        </div>
      )}
    </div>
  )
}
