import { useEffect, useMemo } from 'react'
import { Snowflake } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const STORAGE_KEY = 'videsaur-christmas'
const FLAKES = 40

/** Header toggle + festive overlay. Preference persisted in localStorage. */
export default function ChristmasTheme() {
  const [enabled, setEnabled] = useLocalStorage(STORAGE_KEY, true)

  useEffect(() => {
    document.documentElement.classList.toggle('christmas', enabled)
  }, [enabled])

  // Stable random layout so flakes don't jump on re-render.
  const flakes = useMemo(
    () =>
      Array.from({ length: FLAKES }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 8,
        duration: 8 + Math.random() * 10,
        delay: -Math.random() * 18,
        drift: (Math.random() - 0.5) * 80,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    [],
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        aria-label={enabled ? 'Disable Christmas theme' : 'Enable Christmas theme'}
        title={enabled ? 'Disable Christmas theme' : 'Enable Christmas theme'}
        className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors ${
          enabled
            ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'border-edge bg-panel text-mid hover:bg-panel-hover hover:text-hi'
        }`}
      >
        <Snowflake className={`size-4 ${enabled ? 'xmas-spin' : ''}`} />
      </button>

      {enabled && (
        <>
          <div className="xmas-lights" aria-hidden="true" />
          <div className="xmas-snow" aria-hidden="true">
            {flakes.map((f) => (
              <span
                key={f.id}
                className="xmas-flake"
                style={{
                  left: `${f.left}%`,
                  width: f.size,
                  height: f.size,
                  opacity: f.opacity,
                  animationDuration: `${f.duration}s`,
                  animationDelay: `${f.delay}s`,
                  '--drift': `${f.drift}px`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
