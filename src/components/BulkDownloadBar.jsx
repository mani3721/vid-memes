import { useState } from 'react'
import { FolderPlus, Package, X, Loader2, Download } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

/** Sticky action bar — only mounts while a selection exists. */
export default function BulkDownloadBar({ count, totalMB, onClear, onSaveToKit, selectedAssets = [] }) {
  if (count === 0) return null

  return (
    <BulkBar
      count={count}
      totalMB={totalMB}
      onClear={onClear}
      onSaveToKit={onSaveToKit}
      selectedAssets={selectedAssets}
    />
  )
}

function BulkBar({ count, totalMB, onClear, onSaveToKit, selectedAssets }) {
  const [state, setState] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleDownload = async () => {
    if (state === 'loading') return

    const memeIds = selectedAssets.map((a) => a.id).filter(Boolean)
    if (memeIds.length === 0) return

    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/api/bulk-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memeIds }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      // Stream the ZIP blob and trigger a browser download
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'videsaur-pack.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setState('idle')
    } catch (err) {
      console.error('[BulkDownloadBar]', err)
      setErrorMsg(err.message ?? 'Download failed. Please try again.')
      setState('error')
    }
  }

  const btnLabel =
    state === 'loading'
      ? 'Preparing your zip…'
      : state === 'error'
        ? 'Retry download'
        : `Download ${count} as .zip`

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-5">
      <div
        data-ad-unsafe="bulk-action"
        className="animate-slide-up pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-edge bg-panel/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-volt text-white">
          <Package className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-hi">
            {count} asset{count === 1 ? '' : 's'} selected
          </p>
          {state === 'error' ? (
            <p className="text-xs text-red-400">{errorMsg}</p>
          ) : (
            <p className="text-xs text-mid">~{totalMB} MB estimated archive</p>
          )}
        </div>

        <button
          type="button"
          onClick={onSaveToKit}
          className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-2 text-xs font-semibold text-hi transition-colors duration-150 hover:border-volt hover:text-volt"
        >
          <FolderPlus className="size-3.5" />
          <span className="hidden sm:inline">Save to Kit</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={state === 'loading'}
          aria-label={btnLabel}
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors duration-150',
            state === 'error'
              ? 'border border-red-500/60 text-red-400 hover:border-red-400'
              : 'bg-volt text-white hover:bg-volt-hi disabled:opacity-60',
          ].join(' ')}
        >
          {state === 'loading' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span className="hidden sm:inline">{btnLabel}</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="grid size-8 shrink-0 place-items-center rounded-full text-mid transition-colors duration-150 hover:bg-white/10 hover:text-hi"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
