import { useEffect, useState } from 'react'
import { Leaf, LeafyGreen } from 'lucide-react'

const STORAGE_KEY = 'videsaur-auto-climate-theme'
const ALLOWED_THEMES = new Set(['default', 'tropical', 'warm', 'cool'])

function getInitialEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export default function ClimateThemeToggle() {
  const [enabled, setEnabled] = useState(getInitialEnabled)

  useEffect(() => {
    const root = document.documentElement
    let active = true

    if (!enabled) {
      delete root.dataset.climateTheme
      try { localStorage.setItem(STORAGE_KEY, 'off') } catch { /* storage is optional */ }
      return () => { active = false }
    }

    try { localStorage.setItem(STORAGE_KEY, 'on') } catch { /* storage is optional */ }

    fetch('/api/location-theme', { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : { theme: 'default' })
      .then(({ theme }) => {
        if (active) root.dataset.climateTheme = ALLOWED_THEMES.has(theme) ? theme : 'default'
      })
      .catch(() => {
        if (active) root.dataset.climateTheme = 'default'
      })

    return () => { active = false }
  }, [enabled])

  const label = enabled ? 'Turn off automatic regional theme' : 'Turn on automatic regional theme'

  return (
    <button
      type="button"
      onClick={() => setEnabled((value) => !value)}
      aria-label={label}
      aria-pressed={enabled}
      title={label}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-panel text-mid transition-colors hover:bg-panel-hover hover:text-hi"
    >
      {enabled ? <LeafyGreen className="size-4 text-brand" /> : <Leaf className="size-4" />}
    </button>
  )
}
