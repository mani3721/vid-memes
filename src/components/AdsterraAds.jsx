import { useEffect, useRef } from 'react'
import { useConsent } from '../consent/consentStore'

const POPUNDER_URL =
  'https://pl31708202.profitableratecpmnetwork.com/67/69/53/676953c0ba8ce919e0b2078e105e7c04.js'
const SOCIAL_BAR_URL =
  'https://pl31708203.profitableratecpmnetwork.com/32/0c/35/320c354ab607c1de1e15f25edf8958a4.js'
const NATIVE_BANNER_URL =
  'https://pl31708204.profitableratecpmnetwork.com/e711522f5deae38d82fdd9441db23d41/invoke.js'
const NATIVE_CONTAINER_ID = 'container-e711522f5deae38d82fdd9441db23d41'

function appendScript({ id, src, parent = document.body, before = null, attributes = {} }) {
  if (document.getElementById(id)) return

  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true

  Object.entries(attributes).forEach(([name, value]) => {
    script.setAttribute(name, value)
  })

  parent.insertBefore(script, before)
}

/**
 * Loads the requested ad-network tags only after explicit advertising consent.
 * Script IDs make loading idempotent under React Strict Mode and route changes.
 */
export default function AdsterraAds() {
  const { adsAllowed } = useConsent()
  const nativeWrapperRef = useRef(null)

  useEffect(() => {
    if (!adsAllowed) return

    appendScript({
      id: 'adsterra-popunder-script',
      src: POPUNDER_URL,
    })
    appendScript({
      id: 'adsterra-social-bar-script',
      src: SOCIAL_BAR_URL,
    })

    const wrapper = nativeWrapperRef.current
    const container = document.getElementById(NATIVE_CONTAINER_ID)
    if (wrapper && container) {
      appendScript({
        id: 'adsterra-native-banner-script',
        src: NATIVE_BANNER_URL,
        parent: wrapper,
        before: container,
        attributes: { 'data-cfasync': 'false' },
      })
    }
  }, [adsAllowed])

  if (!adsAllowed) return null

  return (
    <aside
      ref={nativeWrapperRef}
      aria-label="Advertisement"
      className="mx-auto my-10 max-w-7xl px-4 sm:px-6"
    >
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-mid">
        Advertisement
      </p>
      <div id={NATIVE_CONTAINER_ID} />
    </aside>
  )
}
