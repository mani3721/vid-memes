import { AudioLines } from 'lucide-react'
import { compact } from '../data/assets'
import { useCategoryMemes } from '../hooks/useMemes'
import DownloadButton from './DownloadButton'

const BARS = [5, 9, 14, 8, 17, 11, 6, 13, 9, 16, 7, 12, 5, 10, 15, 8]

export default function SoundGrabStrip() {
  const { memes: sounds } = useCategoryMemes({ category: 'sounds', limit: 10 })

  if (sounds.length === 0) return null

  return (
    <section aria-labelledby="sfx-heading">
      <div className="mb-2.5 flex items-center gap-2">
        <AudioLines className="size-4 text-volt" />
        <h2 id="sfx-heading" className="font-display text-lg tracking-wide text-hi">
          GRAB THE SOUND ONLY
        </h2>
      </div>

      <div className="scrollbar-hide -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {sounds.map((sfx) => (
          <div
            key={sfx.id}
            className="flex w-52 shrink-0 items-center gap-3 rounded-2xl border border-edge bg-panel p-3 transition-colors duration-150 hover:border-volt/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-hi">{sfx.title}</p>

              <div aria-hidden className="mt-1.5 flex h-5 items-center gap-[2px]">
                {BARS.map((h, i) => (
                  <span key={i} className="w-[2px] shrink-0 rounded-full bg-volt/70" style={{ height: `${h}px` }} />
                ))}
              </div>

              <p className="mt-1 text-[11px] text-mid">
                {sfx.sizeMB} MB · {compact(sfx.editorUses)} downloads
              </p>
            </div>

            <DownloadButton
              label={`Download ${sfx.title}`}
              href={sfx.publicUrl}
              filename={sfx.filename}
              memeId={sfx.id}
              size="sm"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
