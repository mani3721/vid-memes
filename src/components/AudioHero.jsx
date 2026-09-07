import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, AudioLines } from 'lucide-react'
import { waveformBars, claimPlayback, releasePlayback, formatTime } from '../utils/audioPreview'

const BAR_COUNT = 64

/**
 * Hero panel for a sound's detail page: generated cover art plus a full
 * player.
 *
 * Two problems it solves. First, audio has no frame to grab, so
 * generateThumbnail() in server/routes/upload.js writes a flat
 * rgb(18,16,28) square as a placeholder — rendering that through the normal
 * <img> path produced a large black rectangle with nothing in it. Second, the
 * detail page had no player at all, which became a real gap once downloading
 * moved here from the list rows: you could download a sound you had no way to
 * hear.
 *
 * The artwork is generated from the track id rather than fetched, so it is
 * stable per track, unique between tracks, and costs no request. That also
 * means it works for every sound already uploaded, with no re-processing.
 */
export default function AudioHero({ asset }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(asset.duration_seconds ?? 0)
  const [current, setCurrent] = useState(0)

  const bars = useMemo(() => waveformBars(asset.id, BAR_COUNT), [asset.id])
  const progress = duration > 0 ? (current / duration) * 100 : 0

  // Release the single-player claim on unmount so navigating away does not
  // leave a stale reference that silently swallows the next play.
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
        releasePlayback(audio)
      }
    }
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      return
    }
    claimPlayback(audio)
    audio.play().then(() => setPlaying(true)).catch(() => {})
  }, [playing])

  const seekTo = useCallback((ratio) => {
    const audio = audioRef.current
    if (!audio?.duration) return
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration
    setCurrent(audio.currentTime)
  }, [])

  function handleBarClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    seekTo((e.clientX - rect.left) / rect.width)
  }

  // The waveform is the only seek control, so it has to work without a mouse.
  function handleKeyDown(e) {
    const audio = audioRef.current
    if (!audio?.duration) return
    const step = 5 // seconds
    if (e.key === 'ArrowRight') { e.preventDefault(); seekTo((audio.currentTime + step) / audio.duration) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); seekTo((audio.currentTime - step) / audio.duration) }
    if (e.key === 'Home')       { e.preventDefault(); seekTo(0) }
    if (e.key === 'End')        { e.preventDefault(); seekTo(1) }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() }
  }

  return (
    <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden bg-canvas">
      {/* Generated cover art: brand-tinted wash, no imagery to load. */}
      <div aria-hidden className="absolute inset-0 bg-brand-gradient opacity-20" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,62,158,0.22), transparent 65%)' }}
      />

      <audio
        ref={audioRef}
        src={asset.publicUrl}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={(e) => { setPlaying(false); setCurrent(0); releasePlayback(e.currentTarget) }}
      />

      <div className="relative flex w-full flex-col items-center gap-5 px-6">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-mid">
          <AudioLines className="size-3.5 text-brand" aria-hidden />
          {asset.format} Sound Effect
        </span>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${asset.title}` : `Play ${asset.title}`}
          className="btn-primary grid size-20 place-items-center rounded-full shadow-lg shadow-brand/30 transition-transform duration-150 hover:scale-105"
        >
          {playing
            ? <Pause className="size-8" strokeWidth={2.5} />
            : <Play className="size-8 translate-x-0.5" strokeWidth={2.5} />}
        </button>

        {/* Waveform seek bar */}
        <div className="flex w-full max-w-md items-center gap-3">
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-mid">
            {formatTime(current)}
          </span>

          <div
            role="slider"
            tabIndex={0}
            aria-label={`Seek ${asset.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            onClick={handleBarClick}
            onKeyDown={handleKeyDown}
            className="flex h-14 flex-1 cursor-pointer items-end justify-center gap-[2px] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {bars.map((h, i) => {
              const played = (i / bars.length) * 100 <= progress
              return (
                <span
                  key={i}
                  aria-hidden
                  className={`w-[3px] shrink-0 origin-bottom rounded-full transition-colors duration-75 ${
                    played ? 'bg-brand' : 'bg-brand/25'
                  }`}
                  style={{
                    height: `${h}%`,
                    ...(playing && {
                      animation: `waveplay ${420 + (i * 41) % 360}ms ease-in-out ${(i * 53) % 280}ms infinite`,
                    }),
                  }}
                />
              )
            })}
          </div>

          <span className="w-10 shrink-0 text-xs tabular-nums text-mid">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
