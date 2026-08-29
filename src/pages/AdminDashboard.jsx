import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

function authHeaders(session) {
  return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading, session } = useAuth()
  const navigate = useNavigate()
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState({}) // memeId → 'approve' | 'reject'

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) { navigate('/'); return }
    fetchPending()
  }, [authLoading, isAdmin])

  async function fetchPending() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending`, {
        headers: authHeaders(session),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load')
      const data = await res.json()
      setMemes(data.memes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function approve(memeId) {
    setBusy((b) => ({ ...b, [memeId]: 'approve' }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/approve/${memeId}`, {
        method: 'POST',
        headers: authHeaders(session),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      setMemes((prev) => prev.filter((m) => m.id !== memeId))
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[memeId]; return n })
    }
  }

  async function reject(memeId) {
    setBusy((b) => ({ ...b, [memeId]: 'reject' }))
    try {
      const res = await fetch(`${API_BASE}/api/admin/reject/${memeId}`, {
        method: 'DELETE',
        headers: authHeaders(session),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed')
      setMemes((prev) => prev.filter((m) => m.id !== memeId))
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[memeId]; return n })
    }
  }

  if (authLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-volt" /></div>
  }

  return (
    <>
      <SEO title="Admin Dashboard — Videsaur" description="Review and moderate pending meme uploads." canonicalPath="/admin" />

      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-volt" />
          <h1 className="font-display text-2xl tracking-wide text-hi">PENDING APPROVAL</h1>
          <span className="ml-auto rounded-full bg-volt/15 px-3 py-1 text-xs font-semibold text-volt">
            {memes.length} waiting
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
            <button onClick={fetchPending} className="ml-auto font-semibold text-hi hover:underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-volt" /></div>
        ) : memes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <CheckCircle2 className="size-12 text-volt/50" />
            <p className="text-mid">All clear — no pending memes.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memes.map((meme) => (
              <div key={meme.id} className="overflow-hidden rounded-2xl border border-edge bg-panel">
                <img
                  src={meme.thumbnail_url}
                  alt={meme.title}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate font-semibold text-hi">{meme.title}</p>
                  <p className="mt-0.5 text-xs text-mid">
                    {meme.category} · {meme.format} · {(meme.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <p className="mt-0.5 text-xs text-mid/60">
                    {new Date(meme.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={!!busy[meme.id]}
                      onClick={() => approve(meme.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-volt/15 py-2 text-xs font-semibold text-volt transition-colors hover:bg-volt/25 disabled:opacity-50"
                    >
                      {busy[meme.id] === 'approve'
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <CheckCircle2 className="size-3.5" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={!!busy[meme.id]}
                      onClick={() => reject(meme.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {busy[meme.id] === 'reject'
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <XCircle className="size-3.5" />}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
