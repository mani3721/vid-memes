import { useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { compact, timeAgo } from '../data/assets'
import DownloadButton from './DownloadButton'

// LCG-based deterministic bar heights so every sound has a unique waveform
function waveformBars(id = '', count = 36) {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0
  return Array.from({ length: count }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return 18 + (seed % 64) // 18–82 % height
  })
}

// Module-level ref so pausing one card pauses any other currently playing
let _activeAudio = null

export default function SoundCard({ sfx, stagger = 0 }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const bars = waveformBars(sfx.id)
  const age = timeAgo(sfx.createdAt)

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      if (_activeAudio && _activeAudio !== audio) {
        _activeAudio.pause()
        _activeAudio.currentTime = 0
      }
      _activeAudio = audio
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
    if (_activeAudio === audioRef.current) _activeAudio = null
  }

  function handleSeek(e) {
    const a = audioRef.current
    if (!a?.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration
    if (!playing) {
      if (_activeAudio && _activeAudio !== a) {
        _activeAudio.pause()
        _activeAudio.currentTime = 0
      }
      _activeAudio = a
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
          <p className="truncate text-sm font-semibold text-hi">{sfx.title}</p>
          <p className="mt-0.5 text-xs text-lo">
            {sfx.format} · {sfx.sizeMB} MB · {compact(sfx.editorUses)} downloads
            {age && <> · {age}</>}
          </p>
        </div>

        <DownloadButton
          label={`Download ${sfx.title} sound effect`}
          href={sfx.publicUrl}
          filename={sfx.filename}
          memeId={sfx.id}
          size="sm"
        />
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
