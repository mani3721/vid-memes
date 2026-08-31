import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

/**
 * Inline scrub bar so editors can check clip timing without downloading.
 * There is no real video source in this build, so playback is a simulated
 * timeline driven by rAF — the scrub/seek interaction is fully wired.
 */
export default function PreviewPlayer({ duration, compact: dense = false }) {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    if (!playing || !duration) return

    let last = performance.now()
    const tick = (now) => {
      const delta = (now - last) / 1000
      last = now
      setTime((t) => {
        const next = t + delta
        return next >= duration ? 0 : next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, duration])

  if (!duration) {
    return <p className={`text-[11px] text-mid ${dense ? '' : 'py-1'}`}>Still image</p>
  }

  const pct = (time / duration) * 100

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setPlaying((v) => !v)}
        data-ad-unsafe="play"
        aria-label={playing ? 'Pause preview' : 'Play preview'}
        className="grid size-6 shrink-0 place-items-center rounded-full bg-panel-hover text-hi transition-colors duration-150 hover:bg-brand"
      >
        {playing ? <Pause className="size-3" /> : <Play className="size-3 translate-x-px" />}
      </button>

      <label className="sr-only" htmlFor={`scrub-${duration}-${Math.round(pct)}`}>
        Scrub preview
      </label>
      <input
        type="range"
        min="0"
        max={duration}
        step="0.1"
        value={time}
        onChange={(e) => setTime(Number(e.target.value))}
        aria-label="Scrub preview"
        className="h-1 min-w-0 flex-1 accent-brand"
      />

      <span className="shrink-0 text-[10px] tabular-nums text-mid">
        {time.toFixed(1)}s / {duration}s
      </span>
    </div>
  )
}
