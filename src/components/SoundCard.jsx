import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause } from 'lucide-react'
import { compact, timeAgo } from '../data/assets'
import { toMemeUrl } from '../utils/seo'
import { waveformBars, claimPlayback, releasePlayback } from '../utils/audioPreview'

export default function SoundCard({ sfx, stagger = 0 }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  // Deterministic from sfx.id — memoized so playback progress ticks don't recompute it
  const bars = useMemo(() => waveformBars(sfx.id), [sfx.id])
  const age = timeAgo(sfx.createdAt)
  // toMemeUrl dispatches on category, so a sound resolves to /sound/<slug>.
  const detailUrl = toMemeUrl(sfx)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      claimPlayback(audio)
      audio.play().catch(() => {})
      setPlaying(true)
    }
  }

  function handleTimeUpdate() {
    const a = audioRef.current
    if (!a?.duration) return
    setProgress((a.currentTime / a.duration) * 100)
  }

  function handlePause() {
    setPlaying(false)
  }

  function handleEnded() {
    setPlaying(false)
    setProgress(0)
    releasePlayback(audioRef.current)
  }

  function handleSeek(e) {
    const a = audioRef.current
    if (!a?.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
    if (!playing) {
      claimPlayback(a)
      a.play().catch(() => {})
      setPlaying(true)
    }
  }

  return (
    <div className="reveal-item" style={{ '--stagger': stagger }}>
    <div className="reveal-card flex flex-col gap-3 rounded-2xl border border-edge bg-panel p-4 transition-colors hover:border-brand/40 hover:bg-panel-hover">
      <audio
        ref={audioRef}
        src={sfx.publicUrl}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
      />

      {/* Top row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? `Pause ${sfx.title}` : `Play ${sfx.title}`}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-ink transition-colors hover:bg-brand-2"
        >
          {playing
            ? <Pause className="size-4" />
            : <Play className="size-4 translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          {/*
            The title is the route into the detail page, which is where the
            download button now lives. Previously the row carried its own
            download control, which meant a list of sounds was a wall of
            download buttons sitting next to ad slots with no page of their
            own behind them.
          */}
          <Link
            to={detailUrl}
            className="block truncate text-sm font-semibold text-hi transition-colors hover:text-brand"
          >
            {sfx.title}
          </Link>
          <p className="mt-0.5 text-xs text-lo">
            {sfx.format} · {sfx.sizeMB} MB · {compact(sfx.editorUses)} downloads
            {age && <> · {age}</>}
          </p>
        </div>
      </div>

      {/* Waveform / seek bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${sfx.title} playback`}
        onClick={handleSeek}
        className="relative flex h-12 cursor-pointer items-end justify-center gap-[2px] overflow-hidden rounded-xl bg-panel-hover px-2 pb-1"
      >
        {bars.map((h, i) => {
          const played = (i / bars.length) * 100 <= progress
          return (
            <span
              key={i}
              className={[
                'w-[3px] shrink-0 origin-bottom rounded-full transition-colors duration-75',
                played ? 'bg-brand' : 'bg-brand/25',
              ].join(' ')}
              style={{
                height: `${h}%`,
                ...(playing && {
                  animation: `waveplay ${420 + (i * 41) % 360}ms ease-in-out ${(i * 53) % 280}ms infinite`,
                }),
              }}
            />
          )
        })}

        {/* Progress cursor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 border-r border-brand/50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    </div>
  )
}
