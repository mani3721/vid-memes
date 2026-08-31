import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { compact } from '../data/assets'
import { useTrendingMemes } from '../hooks/useMemes'
import DownloadButton from './DownloadButton'

const SLIDE_MS = 5000

export default function StoryReel() {
  const { memes: reel, loading } = useTrendingMemes({ limit: 8 })
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)

  const goTo = useCallback((index) => {
    const track = trackRef.current
    if (!track || reel.length === 0) return
    const clamped = (index + reel.length) % reel.length
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
  }, [reel.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setActive(Math.round(track.scrollLeft / track.clientWidth))
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [])

  useEffect(() => {
    if (!playing || reel.length === 0) return
    const id = setInterval(() => { if (!document.hidden) goTo(active + 1) }, SLIDE_MS)
    return () => clearInterval(id)
  }, [playing, active, goTo, reel.length])

  if (loading || reel.length === 0) return null

  const slide = reel[active] ?? reel[0]

  return (
    <section
      aria-label="Trending meme reel"
      className="relative overflow-hidden rounded-3xl bg-panel"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      onFocusCapture={() => setPlaying(false)}
      onBlurCapture={() => setPlaying(true)}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <img
          src={slide.thumb}
          alt=""
          className="size-full scale-125 object-cover opacity-25 blur-3xl transition-opacity duration-500"
        />
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide relative flex snap-x snap-mandatory overflow-x-auto"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`Slide ${active + 1} of ${reel.length}`}
      >
        {reel.map((item, i) => (
          <div
            key={item.id}
            className="flex w-full shrink-0 snap-center items-center justify-center p-5 sm:p-8"
            inert={i !== active}
          >
            <div className="flex w-full max-w-5xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-9">
              <div className="torn-b paper-lift relative aspect-[4/5] w-full max-w-[16rem] shrink-0 overflow-hidden bg-panel-hover sm:max-w-[19rem]">
                <img
                  src={item.thumb}
                  alt={item.title}
                  loading={i <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`size-full object-cover transition-transform duration-[6000ms] ease-linear ${
                    i === active ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className="absolute left-2 top-2 rounded-full bg-canvas/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-hi backdrop-blur-sm">
                  Preview
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center text-center sm:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand">
                  Trending #{i + 1}
                </p>
                <h3 className="mt-1.5 font-display text-3xl leading-[0.95] tracking-wide text-hi sm:text-4xl lg:text-5xl">
                  {item.title.toUpperCase()}
                </h3>
                <div className="mt-2.5 flex items-center justify-center gap-3 text-sm text-mid sm:justify-start">
                  <span>😂 {compact(item.reactions.laugh)}</span>
                  <span>🔥 {compact(item.reactions.fire)}</span>
                  <span>💀 {compact(item.reactions.skull)}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <DownloadButton
                    label={`Download ${item.title}`}
                    href={item.publicUrl}
                    filename={item.filename}
                    memeId={item.id}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous meme"
        className="absolute left-2 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-canvas/80 text-hi backdrop-blur-sm transition-colors duration-150 hover:bg-brand">
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" onClick={() => goTo(active + 1)} aria-label="Next meme"
        className="absolute right-2 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-canvas/80 text-hi backdrop-blur-sm transition-colors duration-150 hover:bg-brand">
        <ChevronRight className="size-5" />
      </button>

      <div className="relative flex items-center gap-3 px-4 pb-4 sm:px-6">
        <button type="button" onClick={() => setPlaying((v) => !v)} aria-label={playing ? 'Pause reel' : 'Play reel'}
          className="grid size-7 shrink-0 place-items-center rounded-full text-mid transition-colors duration-150 hover:text-hi">
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <div className="flex flex-1 gap-1.5">
          {reel.map((item, i) => (
            <button key={item.id} type="button" onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}
              className="group h-1 flex-1 overflow-hidden rounded-full bg-white/15">
              <span className={`block h-full rounded-full transition-[width] duration-300 ${
                i < active ? 'w-full bg-white/40' : i === active ? 'w-full bg-brand' : 'w-0'
              }`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Unmute previews' : 'Mute previews'} aria-pressed={!muted}
          className="grid size-7 shrink-0 place-items-center rounded-full text-mid transition-colors duration-150 hover:text-hi">
          {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        </button>
      </div>
    </section>
  )
}
