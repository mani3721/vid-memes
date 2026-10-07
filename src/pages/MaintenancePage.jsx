import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock3, Copy, Share2, ThumbsUp } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const REACTION_KEY = 'videsaur-maintenance-reaction'
const REACTION_COUNTS_KEY = 'videsaur-maintenance-reaction-counts'
const SHARE_IMAGE_URL = '/Vidsaur.png'
const DIALOGUE = "Hi folks! The site has reached its usage limits. Our services will renew in a few days. If you'd like to help us renew them sooner, please visit our support page."

const REACTIONS = [
  { id: 'smile', emoji: '😊', label: 'Smile' },
  { id: 'thumb', emoji: '👍', label: 'Thumbs up' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'unhappy', emoji: '☹️', label: 'Unhappy' },
]

function getSavedReaction() {
  try {
    const saved = localStorage.getItem(REACTION_KEY)
    return REACTIONS.some(({ id }) => id === saved) ? saved : null
  } catch {
    return null
  }
}

function getSavedReactionCounts() {
  const emptyCounts = Object.fromEntries(REACTIONS.map(({ id }) => [id, 0]))

  try {
    const savedCounts = JSON.parse(localStorage.getItem(REACTION_COUNTS_KEY) || '{}')
    const selectedReaction = getSavedReaction()

    REACTIONS.forEach(({ id }) => {
      const count = Number(savedCounts[id])
      emptyCounts[id] = Number.isSafeInteger(count) && count >= 0 ? count : 0
    })

    // Include reactions saved before counts were introduced.
    if (selectedReaction && emptyCounts[selectedReaction] === 0) {
      emptyCounts[selectedReaction] = 1
    }
  } catch {
    // Ignore invalid or unavailable storage and start with empty counts.
  }

  return emptyCounts
}

export default function MaintenancePage() {
  const [reaction, setReaction] = useState(getSavedReaction)
  const [reactionCounts, setReactionCounts] = useState(getSavedReactionCounts)
  const [shared, setShared] = useState(false)

  function chooseReaction(id) {
    const next = reaction === id ? null : id
    setReaction(next)

    setReactionCounts((currentCounts) => {
      const nextCounts = { ...currentCounts }

      if (reaction) nextCounts[reaction] = Math.max(0, nextCounts[reaction] - 1)
      if (next) nextCounts[next] += 1

      try {
        localStorage.setItem(REACTION_COUNTS_KEY, JSON.stringify(nextCounts))
      } catch {
        // Storage can be unavailable in private browsing; the UI still works.
      }

      return nextCounts
    })

    try {
      if (next) localStorage.setItem(REACTION_KEY, next)
      else localStorage.removeItem(REACTION_KEY)
    } catch {
      // Storage can be unavailable in private browsing; the UI still works.
    }
  }

  async function shareUpdate() {
    const shareData = {
      title: 'Videsaur maintenance update',
      text: DIALOGUE,
      url: window.location.origin,
    }

    try {
      const response = await fetch(SHARE_IMAGE_URL)
      if (response.ok) {
        const image = new File([await response.blob()], 'Vidsaur.png', {
          type: 'image/png',
        })
        const dataWithImage = { ...shareData, files: [image] }

        if (navigator.share && navigator.canShare?.(dataWithImage)) {
          await navigator.share(dataWithImage)
          setShared(true)
          return
        }
      }

      if (navigator.share) {
        await navigator.share(shareData)
        setShared(true)
        return
      }

      await navigator.clipboard.writeText(`${DIALOGUE}\n${window.location.origin}`)
      setShared(true)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(`${DIALOGUE}\n${window.location.origin}`)
          setShared(true)
        } catch {
          setShared(false)
        }
      }
    }

    window.setTimeout(() => setShared(false), 2200)
  }

  return (
    <div className="min-h-screen bg-canvas text-hi">
      <header className="flex h-16 items-center justify-between border-b border-edge bg-panel px-4 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-edge bg-canvas px-3 py-1.5 text-xs font-semibold text-mid sm:flex">
            <Clock3 className="size-3.5 text-brand" aria-hidden="true" />
            Maintenance mode
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4 py-10">
        <section className="w-full text-center" aria-labelledby="maintenance-title">
          <div className="mx-auto mb-8 w-64 sm:w-96">
            <img
              src={SHARE_IMAGE_URL}
              alt="Videsaur dinosaur"
              className="h-auto w-full object-contain drop-shadow-xl"
            />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-brand">We’ll be right back</p>
          <h1 id="maintenance-title" className="font-display text-4xl tracking-wide sm:text-6xl">
            HI FOLKS!
          </h1>

          <div className="mx-auto mt-7 max-w-xl rounded-3xl border border-edge bg-panel p-5 text-left shadow-lg sm:p-7">
            <p className="text-base leading-7 text-mid sm:text-lg">“{DIALOGUE}”</p>
            <Link
              to="/support-us"
              className="mt-4 inline-flex font-semibold text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:text-hi"
            >
              Visit the support page
            </Link>

            <div className="mt-6 border-t border-edge pt-5">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-lo">
                How does this make you feel?
              </p>
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Maintenance reactions">
                {REACTIONS.map(({ id, emoji, label }) => {
                  const selected = reaction === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseReaction(id)}
                      aria-pressed={selected}
                      aria-label={`${label}: ${reactionCounts[id]} reactions`}
                      className={`flex min-w-16 items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xl transition-all hover:-translate-y-0.5 hover:border-brand ${
                        selected
                          ? 'border-brand bg-brand/15 shadow-md shadow-brand/10'
                          : 'border-edge bg-canvas'
                      }`}
                    >
                      <span aria-hidden="true">{emoji}</span>
                      <span className="sr-only">{label}: </span>
                      <span className="text-xs font-bold tabular-nums" aria-hidden="true">
                        {reactionCounts[id]}
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={shareUpdate}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-fill px-5 py-3 font-semibold text-ink transition-colors hover:bg-brand-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {shared ? <Check className="size-4" /> : <Share2 className="size-4" />}
                {shared ? 'Update shared' : 'Share this update'}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-lo">
                {shared ? <Copy className="size-3" /> : <ThumbsUp className="size-3" />}
                {shared ? 'Copied if sharing is unavailable.' : 'Your reaction is saved on this device.'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
