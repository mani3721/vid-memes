import { useCallback } from 'react'

const BANNER_KEY = '9a08e5c2bb7b9a29dbc427355168adc1'
const NATIVE_KEY = 'e711522f5deae38d82fdd9441db23d41'
const SCRIPT_KEY = '320c354ab607c1de1e15f25edf8958a4'
const AD_ORIGIN = 'https://bellnewyork.org'

// The banner tag can use document.write. A separate document keeps it from
// overwriting the React application and isolates its global atOptions value.
const bannerDocument = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body><script>var atOptions = ${JSON.stringify({ key: BANNER_KEY, format: 'iframe', height: 60, width: 468, params: {} })};</script><script src="${AD_ORIGIN}/22/${BANNER_KEY}"></script></body></html>`

/** Render only inside a consent-gated, placement-audited AdSlot. */
export default function AstraAd({ format }) {
  const mountNative = useCallback((container) => {
    // Ref callbacks replay in StrictMode. Keep the marker on the DOM node so
    // neither a replay nor a normal re-render requests this placement twice.
    if (!container || container.dataset.astraLoaded) return
    container.dataset.astraLoaded = 'true'

    const nativeScript = document.createElement('script')
    nativeScript.async = true
    nativeScript.setAttribute('data-cfasync', 'false')
    nativeScript.src = `${AD_ORIGIN}/21/${NATIVE_KEY}`
    container.appendChild(nativeScript)

    // This tag is document-wide, not a per-slot tag. Leave its marker mounted
    // across SPA navigation to prevent installing duplicate event handlers.
    if (!document.getElementById('astra-document-script')) {
      const script = document.createElement('script')
      script.id = 'astra-document-script'
      script.setAttribute('data-cfasync', 'false')
      script.src = `${AD_ORIGIN}/14/${SCRIPT_KEY}`
      document.body.appendChild(script)
    }
  }, [])

  if (format === 'banner') {
    return (
      <div className="overflow-x-auto">
        <iframe
          title="Advertisement banner"
          srcDoc={bannerDocument}
          width="468"
          height="60"
          sandbox="allow-scripts allow-popups allow-forms"
          className="mx-auto block border-0"
        />
      </div>
    )
  }

  return <div id={`container-${NATIVE_KEY}`} ref={mountNative} className="min-h-24" />
}
