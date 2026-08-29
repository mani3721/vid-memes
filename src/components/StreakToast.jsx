import { useEffect, useRef, useState } from 'react'
import { useStudio } from '../store/studioStore'

/** Playful nudge that surfaces briefly after a download, then gets out of the way. */
export default function StreakToast() {
  const { downloads } = useStudio()
  const [show, setShow] = useState(false)
  const previous = useRef(downloads)

  useEffect(() => {
    // Only react to increases, not the initial hydration from localStorage.
    if (downloads <= previous.current) {
      previous.current = downloads
      return
    }
    previous.current = downloads
    setShow(true)
    const id = setTimeout(() => setShow(false), 3200)
    return () => clearTimeout(id)
  }, [downloads])

  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-slide-up pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-edge bg-cream px-4 py-2.5 text-sm font-semibold text-ink shadow-2xl shadow-black/50"
    >
      You&rsquo;ve downloaded {downloads} meme{downloads === 1 ? '' : 's'} today 🔥
    </div>
  )
}
