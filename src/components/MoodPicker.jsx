import { MOODS } from '../data/assets'
import { useStudio } from '../store/studioStore'

/** Vibe-based filtering — reads more human than "Category: Funny". */
export default function MoodPicker() {
  const { mood, setMood } = useStudio()

  return (
    <div>
      <h2 className="mb-2.5 text-sm font-semibold tracking-wide text-mid uppercase">
        Mood
      </h2>
      <div
        role="group"
        aria-label="Filter by mood"
        className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {MOODS.map((m) => {
          const active = mood === m.id
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => setMood(active ? null : m.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-[background-color,border-color,color,transform] duration-150 active:scale-95 ${
                active
                  ? 'border-brand bg-brand text-white'
                  : 'border-edge bg-transparent text-mid hover:bg-panel-hover hover:text-hi'
              }`}
            >
              <span className="text-sm leading-none">{m.emoji}</span>
              <span className="whitespace-nowrap font-medium">{m.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
