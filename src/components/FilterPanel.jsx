import { ASPECTS, FORMATS, LICENSES } from '../data/assets'

function Group({ title, children }) {
  return (
    <div className="border-b border-edge py-4 first:pt-0 last:border-0">
      <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-mid">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
        active
          ? 'border-volt bg-volt text-white'
          : 'border-edge text-mid hover:border-mist/50 hover:text-hi'
      }`}
    >
      {children}
    </button>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-hi">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-panel-hover transition-colors duration-150 peer-checked:bg-volt peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-volt"
      >
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform duration-150 peer-checked:translate-x-4" />
      </span>
    </label>
  )
}

/** Editor-facing facets. Everything is controlled by EditorModeLayout. */
export default function FilterPanel({ filters, setFilters, onReset, resultCount }) {
  const toggleIn = (key, value) =>
    setFilters((f) => {
      const list = f[key]
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="font-display text-base tracking-wide text-hi">FILTERS</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-volt transition-opacity duration-150 hover:opacity-70"
        >
          Reset
        </button>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
        <Group title="Format">
          <div className="flex flex-wrap gap-1.5">
            {FORMATS.map((f) => (
              <Chip
                key={f}
                active={filters.formats.includes(f)}
                onClick={() => toggleIn('formats', f)}
              >
                {f}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Aspect ratio">
          <div className="flex flex-wrap gap-1.5">
            {ASPECTS.map((a) => (
              <Chip
                key={a}
                active={filters.aspects.includes(a)}
                onClick={() => toggleIn('aspects', a)}
              >
                {a}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="License">
          <div className="flex flex-wrap gap-1.5">
            {LICENSES.map((l) => (
              <Chip
                key={l}
                active={filters.licenses.includes(l)}
                onClick={() => toggleIn('licenses', l)}
              >
                {l}
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Properties">
          <Toggle
            label="Has transparency"
            checked={filters.alphaOnly}
            onChange={(v) => setFilters((f) => ({ ...f, alphaOnly: v }))}
          />
          <Toggle
            label="Green screen"
            checked={filters.greenOnly}
            onChange={(v) => setFilters((f) => ({ ...f, greenOnly: v }))}
          />
          <Toggle
            label="Sound included"
            checked={filters.soundOnly}
            onChange={(v) => setFilters((f) => ({ ...f, soundOnly: v }))}
          />
        </Group>

        <Group title={`Max duration — ${filters.maxDuration}s`}>
          <input
            type="range"
            min="1"
            max="30"
            value={filters.maxDuration}
            onChange={(e) => setFilters((f) => ({ ...f, maxDuration: Number(e.target.value) }))}
            aria-label="Maximum duration in seconds"
            className="w-full accent-volt"
          />
          <div className="mt-1 flex justify-between text-[11px] text-mid">
            <span>1s</span>
            <span>30s</span>
          </div>
        </Group>
      </div>

      <p className="border-t border-edge pt-3 text-xs text-mid">
        <span className="font-semibold text-hi">{resultCount}</span> assets match
      </p>
    </div>
  )
}
