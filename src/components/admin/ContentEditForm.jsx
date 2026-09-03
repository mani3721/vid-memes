import { useEffect, useState } from 'react'
import { Loader2, Save, X, AlertCircle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOODS } from '../../data/assets'
import { CONTENT_STATUSES, DESCRIPTION_SECTIONS, countWords } from '../../utils/contentSections'
import { toMemeUrl } from '../../utils/seo'
import { getContent, saveContent } from '../../lib/adminApi'
import StatusBadge from './StatusBadge'

const CATEGORIES = ['videos', 'gifs', 'images', 'sounds']

/** The brief's target length for the whole description. */
const TARGET_WORDS = 400

/**
 * Per-section hints, so an author knows what belongs in each box rather than
 * guessing from the heading alone.
 */
const HINTS = {
  what: 'Origin and context of the clip, who is in it, what made it spread. 2–3 sentences.',
  why: 'The emotion or reaction it conveys — sarcasm, shock, humour — and the situations it fits. 2–3 sentences.',
  how: 'WhatsApp status, Instagram Reels, YouTube Shorts, editing projects. 2–3 sentences.',
  quality: 'Format, resolution and watermark-free status in natural language. 1–2 sentences.',
  related: 'A thematic lead-in to the "You Might Also Like" row. 1–2 sentences.',
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-mid">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-lo">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-xl border border-edge bg-canvas px-3 py-2 text-sm text-hi outline-none transition-colors focus:border-brand'

/**
 * Full editor for one asset.
 *
 * The long description is five separate textareas rather than one rich-text
 * field. The page renders a fixed <h3> per subsection, so the structure is not
 * the author's to choose — five boxes make that explicit, keep each section
 * independently reviewable, and avoid shipping a rich-text dependency whose
 * markup would then need sanitising before it reached the page.
 */
export default function ContentEditForm({ memeId, onClose, onSaved }) {
  const [item, setItem] = useState(null)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // The parent renders this with key={memeId}, so a different asset remounts
  // the form rather than reusing it. That is what lets the effect below skip
  // resetting loading/error synchronously — there is never stale state to clear.
  useEffect(() => {
    let active = true
    getContent(memeId)
      .then(({ item: loaded }) => {
        if (!active) return
        setItem(loaded)
        setDraft({
          title: loaded.title ?? '',
          category: loaded.category ?? 'videos',
          content_status: loaded.content_status ?? 'draft',
          is_hot: Boolean(loaded.is_hot),
          needs_description: Boolean(loaded.needs_description),
          mood_tags: loaded.mood_tags ?? [],
          description_long: loaded.description_long ?? {},
        })
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [memeId])

  function setSection(key, value) {
    setDraft((d) => ({ ...d, description_long: { ...d.description_long, [key]: value } }))
  }

  function toggleMood(id) {
    setDraft((d) => ({
      ...d,
      mood_tags: d.mood_tags.includes(id)
        ? d.mood_tags.filter((t) => t !== id)
        : [...d.mood_tags, id],
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { item: saved } = await saveContent(memeId, draft)
      onSaved?.(saved)
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        {error ?? 'Could not load this item.'}
      </div>
    )
  }

  const words = countWords(draft.description_long)

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start gap-3">
        {item?.thumbnail_url && (
          <img src={item.thumbnail_url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={draft.content_status} />
            <span className="text-xs text-mid">{item?.format}</span>
          </div>
          {item && (
            <Link
              to={toMemeUrl(item)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-mid hover:text-brand"
            >
              View live page <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi"
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
          type="text"
          maxLength={200}
          required
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className={inputClass}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Status" hint="Draft and removed hide the page; flagged is a DMCA/policy hold.">
          <select
            value={draft.content_status}
            onChange={(e) => setDraft((d) => ({ ...d, content_status: e.target.value }))}
            className={inputClass}
          >
            {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Mood tags">
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((mood) => {
            const on = draft.mood_tags.includes(mood.id)
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => toggleMood(mood.id)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  on ? 'border-brand bg-brand/15 text-brand' : 'border-edge bg-canvas text-mid hover:text-hi'
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            )
          })}
        </div>
      </Field>

      {/* ── Long-form description ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-edge bg-canvas/50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mid">
            Long description
          </h3>
          <span className={`text-xs ${words >= TARGET_WORDS ? 'text-emerald-400' : 'text-lo'}`}>
            {words} / {TARGET_WORDS} words
          </span>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-lo">
          Write about this specific clip. Generic copy that only swaps the title is
          what triggers a low-value-content review — the page already has the
          templated version, so anything repeated here adds nothing.
        </p>

        <div className="space-y-4">
          {DESCRIPTION_SECTIONS.map(({ key, heading }) => (
            <Field key={key} label={heading} hint={HINTS[key]}>
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.description_long[key] ?? ''}
                onChange={(e) => setSection(key, e.target.value)}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-mid">
          <input
            type="checkbox"
            checked={draft.is_hot}
            onChange={(e) => setDraft((d) => ({ ...d, is_hot: e.target.checked }))}
            className="size-4 accent-brand"
          />
          🔥 Mark as <strong className="text-hi">Hot</strong> — pins this meme to the top of every feed
        </label>
        <label className="flex items-center gap-2 text-sm text-mid">
          <input
            type="checkbox"
            checked={draft.needs_description}
            onChange={(e) => setDraft((d) => ({ ...d, needs_description: e.target.checked }))}
            className="size-4 accent-brand"
          />
          Flag as needing description work
        </label>
      </div>

      <div className="flex gap-2 border-t border-edge pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-panel-hover px-5 py-2 text-sm font-semibold text-mid hover:text-hi"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
