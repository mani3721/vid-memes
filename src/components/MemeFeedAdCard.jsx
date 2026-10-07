import { useEffect, useRef } from 'react'

const AD_KEY = '6559979a533b8e373ce6d2c68867a775'
const AD_SRC = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`
const AD_WIDTH = 300
const AD_HEIGHT = 250

/**
 * Medium-rectangle ad for a masonry-feed column. Of the supplied formats,
 * 300x250 is the standard size that most closely matches a meme card.
 */
export default function MemeFeedAdCard() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    // The vendor script reads this global configuration when it executes.
    window.atOptions = {
      key: AD_KEY,
      format: 'iframe',
      height: AD_HEIGHT,
      width: AD_WIDTH,
      params: {},
    }

    const script = document.createElement('script')
    script.src = AD_SRC
    script.async = true
    mount.appendChild(script)

    return () => {
      script.remove()
      mount.replaceChildren()
    }
  }, [])

  return (
    <article className="overflow-hidden border border-dashed border-edge bg-panel/60">
      <p className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mid">
        Advertisement
      </p>
      <div
        ref={mountRef}
        className="mx-auto h-[250px] w-[300px] max-w-full overflow-hidden"
        aria-label="Advertisement"
      />
    </article>
  )
}
