import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ExternalLink, Loader2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import Markdown from '../Markdown'
import { createPost, deletePost, listPosts, savePost } from '../../lib/adminApi'

const STATUSES = ['draft', 'published', 'removed']

const STATUS_STYLES = {
  published: 'bg-emerald-500/15 text-emerald-400',
  draft: 'bg-status-info/15 text-status-info',
  removed: 'bg-red-500/15 text-red-400',
}

const inputClass =
  'w-full rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-hi outline-none transition-colors focus:border-brand'

const EMPTY = { title: '', slug: '', excerpt: '', body: '', cover_url: '', status: 'draft' }

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mid">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-lo">{hint}</span>}
    </label>
  )
}

/**
 * Blog post manager.
 *
 * Blog posts are a second content type alongside meme pages: editorial copy
 * that is unique by construction, which is what makes it useful both as
 * AdSense-reviewable content and as a source of internal links into the
 * catalogue.
 */
export default function BlogManager() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [draft, setDraft] = useState(null) // null = list view; object = editing
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  // State is only touched from the promise continuations; the handlers that
  // trigger a refetch switch `loading` on themselves.
  useEffect(() => {
    let active = true
    listPosts()
      .then(({ posts: loaded }) => { if (active) { setPosts(loaded); setError(null) } })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [reloadToken])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadToken((t) => t + 1)
  }, [])

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { id, ...patch } = draft
      if (id) await savePost(id, patch)
      else await createPost(patch)
      setDraft(null)
      setPreview(false)
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(post) {
    // Soft-removes by default, so this is reversible from the status dropdown.
    if (!window.confirm(`Move "${post.title}" to removed? It will stop being public.`)) return
    setError(null)
    try {
      await deletePost(post.id)
      reload()
    } catch (err) {
      setError(err.message)
    }
  }

  // ── Editor ─────────────────────────────────────────────────────────────────
  if (draft) {
    return (
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg tracking-wide text-hi">
            {draft.id ? 'Edit post' : 'New post'}
          </h2>
          <button
            type="button"
            onClick={() => { setDraft(null); setPreview(false) }}
            className="ml-auto grid size-8 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi"
            aria-label="Close editor"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        <Field label="Title">
          <input
            type="text" required maxLength={200} value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug" hint={draft.id ? 'Changing this breaks the old URL.' : 'Leave blank to derive from the title.'}>
            <input
              type="text" value={draft.slug}
              onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
              placeholder="top-10-memes-this-week"
              className={inputClass}
            />
          </Field>
          <Field label="Status" hint="Only published posts are public or in the sitemap.">
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              className={inputClass}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Excerpt" hint="Shown on the blog index and used as the meta description.">
          <textarea
            rows={2} maxLength={400} value={draft.excerpt}
            onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field label="Cover image URL" hint="Must be https.">
          <input
            type="url" value={draft.cover_url}
            onChange={(e) => setDraft((d) => ({ ...d, cover_url: e.target.value }))}
            className={inputClass}
          />
        </Field>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mid">Body</span>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="text-xs text-mid underline hover:text-brand"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {preview ? (
            <div className="min-h-48 rounded-xl border border-edge bg-canvas p-4">
              <Markdown source={draft.body} />
            </div>
          ) : (
            <textarea
              rows={16} value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
            />
          )}
          <span className="mt-1 block text-xs text-lo">
            Markdown: <code>## heading</code>, <code>- list</code>, <code>**bold**</code>,
            {' '}<code>[text](/meme/slug)</code>. Link to meme pages to build internal links.
          </span>
        </div>

        <div className="flex gap-2 border-t border-edge pt-4">
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {draft.id ? 'Save post' : 'Create post'}
          </button>
          <button
            type="button"
            onClick={() => { setDraft(null); setPreview(false) }}
            className="rounded-full bg-panel-hover px-5 py-2 text-sm font-semibold text-mid hover:text-hi"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  // ── List ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="size-4" /> New post
        </button>
        <span className="text-xs text-mid">{posts.length} post{posts.length === 1 ? '' : 's'}</span>
        <button
          type="button" onClick={reload}
          className="ml-auto grid size-9 place-items-center rounded-xl bg-panel-hover text-mid hover:text-hi"
          aria-label="Reload"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-brand" /></div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-mid">
          No posts yet. A weekly round-up is an easy first one — it is unique copy and it links into the catalogue.
        </p>
      ) : (
        <ul className="divide-y divide-edge overflow-hidden rounded-2xl border border-edge">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center gap-3 p-3 hover:bg-panel/60">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLES[post.status] ?? 'bg-panel-hover text-mid'}`}>
                    {post.status}
                  </span>
                  <p className="truncate font-medium text-hi">{post.title}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-mid">/blog/{post.slug}</p>
              </div>

              {post.status === 'published' && (
                <Link
                  to={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi"
                  aria-label={`View ${post.title}`}
                >
                  <ExternalLink className="size-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setDraft({
                  id: post.id, title: post.title, slug: post.slug,
                  excerpt: post.excerpt ?? '', body: post.body ?? '',
                  cover_url: post.cover_url ?? '', status: post.status,
                })}
                className="shrink-0 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/25"
              >
                Edit
              </button>
              <button
                type="button" onClick={() => remove(post)}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
                aria-label={`Remove ${post.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
