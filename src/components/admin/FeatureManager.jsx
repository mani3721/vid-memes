import { useEffect, useState } from 'react'
import { Loader2, Rss, Shapes, ShoppingBag, AlertCircle } from 'lucide-react'
import { listFeatureFlags, setFeatureFlag } from '../../lib/adminApi'

const FLAG_META = {
  feed_tab:         { label: 'Feed Tab',          description: 'Show the Feed tab in the sidebar navigation.', icon: Rss },
  stickers_tab:     { label: 'Stickers Tab',       description: 'Show the Stickers tab in the sidebar navigation.', icon: Shapes },
  amazon_affiliate: { label: 'Amazon Affiliate',   description: 'Show Amazon affiliate product sections on browse and meme detail pages.', icon: ShoppingBag },
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-brand' : 'bg-panel-hover'
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function FeatureManager() {
  const [flags, setFlags]   = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]     = useState({})
  const [error, setError]   = useState(null)

  useEffect(() => {
    listFeatureFlags()
      .then(({ flags: loaded }) => setFlags(loaded))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(key, enabled) {
    setBusy((b) => ({ ...b, [key]: true }))
    setError(null)
    try {
      const { flag } = await setFeatureFlag(key, enabled)
      setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: flag.enabled } : f)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[key]; return n })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-mid">
        Toggle site features on or off. Changes take effect for all visitors immediately.
      </p>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="divide-y divide-edge rounded-2xl border border-edge bg-panel">
        {flags.map(({ key, enabled, updated_at }) => {
          const meta = FLAG_META[key]
          if (!meta) return null
          const Icon = meta.icon
          return (
            <div key={key} className="flex items-center gap-4 px-5 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="size-5 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-hi">{meta.label}</p>
                <p className="text-sm text-mid">{meta.description}</p>
                {updated_at && (
                  <p className="mt-0.5 text-xs text-mid/50">
                    Last changed {new Date(updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {busy[key] && <Loader2 className="size-4 animate-spin text-brand" />}
                <Toggle
                  checked={enabled}
                  onChange={(val) => toggle(key, val)}
                  disabled={!!busy[key]}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
