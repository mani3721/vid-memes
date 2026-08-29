import { useState } from 'react'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import { useStudio } from '../store/studioStore'
import DownloadButton from './DownloadButton'

/** Named collections editors build up across sessions (persisted). */
export default function ProjectKits() {
  const { kits, createKit, removeKit } = useStudio()
  const [name, setName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createKit(trimmed)
    setName('')
  }

  return (
    <section aria-labelledby="kits-heading" className="rounded-2xl border border-edge bg-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <FolderOpen className="size-4 text-volt" />
        <h2 id="kits-heading" className="font-display text-base tracking-wide text-hi">
          PROJECT KITS
        </h2>
      </div>

      <ul className="flex flex-col gap-2">
        {kits.map((kit) => (
          <li
            key={kit.id}
            className="flex items-center gap-2 rounded-xl border border-edge px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-hi">{kit.name}</p>
              <p className="text-[11px] text-mid">{kit.assetIds.length} assets</p>
            </div>
            <DownloadButton
              label={`Download the ${kit.name} kit`}
              count={kit.assetIds.length}
              size="sm"
            />
            <button
              type="button"
              onClick={() => removeKit(kit.id)}
              aria-label={`Delete ${kit.name}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-mid transition-colors duration-150 hover:bg-white/10 hover:text-hi"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
        {kits.length === 0 && (
          <li className="rounded-xl border border-dashed border-edge py-6 text-center text-xs text-mid">
            No kits yet. Star an asset to start one.
          </li>
        )}
      </ul>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <label htmlFor="new-kit" className="sr-only">
          New kit name
        </label>
        <input
          id="new-kit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New kit name…"
          className="min-w-0 flex-1 rounded-lg border border-edge bg-canvas px-3 py-2 text-xs text-hi placeholder:text-mid focus:border-volt focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Create kit"
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-volt text-white transition-colors duration-150 hover:bg-volt-hi"
        >
          <Plus className="size-4" />
        </button>
      </form>
    </section>
  )
}
