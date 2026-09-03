import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, AlertCircle, ShieldCheck, Pencil, Check, X, FileText, Newspaper, Inbox } from 'lucide-react'
import { useAuth } from '../lib/authContext'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import ContentEditor from '../components/admin/ContentEditor'
import BlogManager from '../components/admin/BlogManager'
import { approveMeme, listPending, rejectMeme, renameMeme } from '../lib/adminApi'

const TABS = [
  { id: 'pending', label: 'Pending Approval', icon: Inbox },
  { id: 'content', label: 'Content Editor', icon: FileText },
  { id: 'blog', label: 'Blog', icon: Newspaper },
]

/** The original moderation queue, unchanged in behaviour. */
function PendingQueue() {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState({})      // memeId → 'approve' | 'reject' | 'rename'
  const [editing, setEditing] = useState({}) // memeId → draft title string
  const [reloadToken, setReloadToken] = useState(0)

  // State is only set from the promise continuations so the effect never
  // cascades a synchronous re-render.
  useEffect(() => {
    let active = true
    listPending()
      .then(({ memes: loaded }) => { if (active) { setMemes(loaded); setError(null) } })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadToken])

  function retry() {
    setLoading(true)
    setReloadToken((t) => t + 1)
  }

  async function approve(memeId) {
    setBusy((b) => ({ ...b, [memeId]: 'approve' }))
    try {
      await approveMeme(memeId)
      setMemes((prev) => prev.filter((m) => m.id !== memeId))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[memeId]; return n })
    }
  }

  async function rename(memeId) {
    const title = (editing[memeId] ?? '').trim()
    if (!title) return
    setBusy((b) => ({ ...b, [memeId]: 'rename' }))
    try {
      await renameMeme(memeId, title)
      setMemes((prev) => prev.map((m) => m.id === memeId ? { ...m, title } : m))
      setEditing((e) => { const n = { ...e }; delete n[memeId]; return n })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[memeId]; return n })
    }
  }

  async function reject(memeId) {
    setBusy((b) => ({ ...b, [memeId]: 'reject' }))
    try {
      await rejectMeme(memeId)
      setMemes((prev) => prev.filter((m) => m.id !== memeId))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[memeId]; return n })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-mid">Uploads awaiting review</span>
        <span className="ml-auto rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
          {memes.length} waiting
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
          <button onClick={retry} className="ml-auto font-semibold text-hi hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-brand" /></div>
      ) : memes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <CheckCircle2 className="size-12 text-brand/50" />
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
                {/* Inline title editor */}
                {editing[meme.id] !== undefined ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      type="text"
                      maxLength={200}
                      value={editing[meme.id]}
                      onChange={(e) => setEditing((prev) => ({ ...prev, [meme.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') rename(meme.id)
                        if (e.key === 'Escape') setEditing((prev) => { const n = { ...prev }; delete n[meme.id]; return n })
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-brand/50 bg-base px-2 py-1 text-sm font-semibold text-hi outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => rename(meme.id)}
                      disabled={busy[meme.id] === 'rename'}
                      className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand hover:bg-brand/25 disabled:opacity-50"
                      aria-label="Save title"
                    >
                      {busy[meme.id] === 'rename'
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <Check className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing((prev) => { const n = { ...prev }; delete n[meme.id]; return n })}
                      className="grid size-7 shrink-0 place-items-center rounded-lg bg-panel-hover text-mid hover:text-hi"
                      aria-label="Cancel"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="group/title flex items-center gap-1.5">
                    <p className="flex-1 truncate font-semibold text-hi">{meme.title}</p>
                    <button
                      type="button"
                      onClick={() => setEditing((prev) => ({ ...prev, [meme.id]: meme.title }))}
                      className="shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100"
                      aria-label="Edit title"
                    >
                      <Pencil className="size-3.5 text-mid hover:text-hi" />
                    </button>
                  </div>
                )}
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
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand/15 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand/25 disabled:opacity-50"
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
  )
}

/**
 * Tabbed admin shell.
 *
 * The three sections are independent tools rather than steps in a flow —
 * moderation triage, long-form content editing, and the blog — so they get
 * sibling tabs instead of being stacked on one page.
 */
export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true })
  }, [authLoading, isAdmin, navigate])

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <>
      {/*
        noindex: the dashboard is behind an admin check, but a crawler that ever
        reached it must not index it. It is also absent from the sitemap and
        Disallow'd in robots.txt.
      */}
      <SEO
        title="Admin Dashboard"
        description="Moderate uploads, edit content descriptions, and manage blog posts."
        canonicalPath="/admin"
        noindex
      />

      <div className="mx-auto max-w-6xl space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-brand" />
          <h1 className="font-display text-2xl tracking-wide text-hi">ADMIN</h1>
        </div>

        <div role="tablist" aria-label="Admin sections" className="flex gap-1 border-b border-edge">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                tab === id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-mid hover:text-hi'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {/*
            Each panel is keyed and mounted only while active, so switching tabs
            refetches rather than showing a stale list from minutes ago.
          */}
          {tab === 'pending' && <PendingQueue />}
          {tab === 'content' && <ContentEditor />}
          {tab === 'blog' && <BlogManager />}
        </div>
      </div>
    </>
  )
}
