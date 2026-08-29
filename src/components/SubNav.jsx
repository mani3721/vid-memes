import { useEffect, useState } from 'react'
import { SUB_NAV } from '../data/assets'

/** Secondary category rail that reveals itself once the hero scrolls away. */
export default function SubNav() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(SUB_NAV[0])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setVisible(window.scrollY > 320))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className={`sticky top-0 z-30 -mx-4 border-b border-edge bg-canvas/90 backdrop-blur-md transition-[opacity,transform] duration-200 sm:-mx-6 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
    >
      <nav
        data-ad-unsafe="nav"
        aria-label="Quick categories"
        className="scrollbar-hide mx-auto flex max-w-[1600px] gap-1.5 overflow-x-auto px-4 py-2 sm:px-6"
      >
        {SUB_NAV.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(item)}
            aria-current={active === item ? 'true' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
              active === item
                ? 'bg-cream text-ink'
                : 'text-mid hover:bg-white/10 hover:text-hi'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}
