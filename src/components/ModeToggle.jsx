import { useStudio } from '../store/studioStore'

const MODES = [
  { id: 'browse', icon: '🎭', label: 'Browse' },
  { id: 'editor', icon: '🎬', label: 'Editor Mode' },
]

/**
 * Segmented pill. A single sliding thumb (translate-only) sits behind both
 * labels, so the swap animates on the compositor instead of re-laying out.
 */
export default function ModeToggle() {
  const { mode, setMode } = useStudio()
  const index = mode === 'editor' ? 1 : 0

  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className="relative flex shrink-0 items-center rounded-full border border-edge bg-panel p-1"
    >
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          index === 1 ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {MODES.map((m) => {
        const active = m.id === mode
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(m.id)}
            className={`relative z-10 flex w-1/2 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors duration-200 sm:px-4 ${
              active ? 'text-hi' : 'text-mid hover:text-hi'
            }`}
          >
            {/* Icon morph: the outgoing glyph shrinks out as the new one scales in */}
            <span
              className={`inline-block transition-transform duration-300 ${
                active ? 'scale-110' : 'scale-90 opacity-70'
              }`}
            >
              {m.icon}
            </span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
