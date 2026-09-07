import { useEffect, useState } from 'react'
import { Megaphone, Loader2, Send, CircleCheck, CircleAlert } from 'lucide-react'
import { listAnnouncements, sendAnnouncement } from '../../lib/adminApi'
import { timeAgo } from '../../data/assets'

const MAX_TITLE = 200
const MAX_MESSAGE = 2000

const EMPTY = { title: '', message: '', link: '', thumbnail: '', segmentLanguage: '' }

/**
 * Compose and broadcast a site-wide announcement.
 *
 * Stored as one notification row with user_id = NULL, so this is a single
 * insert regardless of userbase size (see migration 006). Per-user read state
 * still works because reads live in their own table.
 *
 * Distinct from the automatic new-content notifications, which are generated
 * by publishing and are not composable here.
 */
export default function AnnouncementSender() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { ok: boolean, text: string }
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listAnnouncements()
      .then(({ announcements }) => { if (!cancelled) setSent(announcements ?? []) })
      .catch(() => { /* the history panel is supplementary; don't block sending */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const titleTrimmed = form.title.trim()
  const canSend = titleTrimmed.length > 0 && titleTrimmed.length <= MAX_TITLE && !sending

  async function submit(e) {
    e.preventDefault()
    if (!canSend) return

    setSending(true)
    setResult(null)
    try {
      const { announcement } = await sendAnnouncement({
        title: titleTrimmed,
        message: form.message.trim() || undefined,
        link: form.link.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        segmentLanguage: form.segmentLanguage.trim() || undefined,
      })
      setSent((prev) => [announcement, ...prev])
      setForm(EMPTY)
      setResult({ ok: true, text: 'Announcement sent to all users.' })
    } catch (err) {
      setResult({ ok: false, text: err.message })
    } finally {
      setSending(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-edge bg-canvas px-3.5 py-2.5 text-sm text-hi placeholder:text-lo focus:border-brand focus:outline-none'

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-edge bg-panel p-5">
        <div className="flex items-center gap-2">
          <Megaphone className="size-4 text-brand" />
          <h2 className="text-sm font-semibold text-hi">Send Announcement</h2>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-mid">
            Title <span className="text-brand">*</span>
          </span>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            maxLength={MAX_TITLE}
            required
            placeholder="New feature: AI voice generator"
            className={fieldClass}
          />
          <span className="self-end text-[10px] text-lo">{form.title.length}/{MAX_TITLE}</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-mid">Message</span>
          <textarea
            value={form.message}
            onChange={set('message')}
            maxLength={MAX_MESSAGE}
            rows={3}
            placeholder="Tell users what changed and why they should care."
            className={`${fieldClass} resize-y`}
          />
          <span className="self-end text-[10px] text-lo">{form.message.length}/{MAX_MESSAGE}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-mid">Link</span>
            <input
              type="text"
              value={form.link}
              onChange={set('link')}
              placeholder="/ai-sound"
              className={fieldClass}
            />
            {/* The server rejects absolute URLs — a broadcast that could point
                anywhere would be an open redirect aimed at every user. */}
            <span className="text-[10px] text-lo">Site-relative path, must start with &ldquo;/&rdquo;.</span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-mid">Thumbnail URL</span>
            <input
              type="text"
              value={form.thumbnail}
              onChange={set('thumbnail')}
              placeholder="https://cdn.videsaur.co.in/…"
              className={fieldClass}
            />
            <span className="text-[10px] text-lo">https:// URL or site-relative path.</span>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-mid">Audience</span>
          <input
            type="text"
            value={form.segmentLanguage}
            onChange={set('segmentLanguage')}
            placeholder="Leave blank to send to everyone"
            className={fieldClass}
          />
          {/*
            Honest about the current state: the column exists and the matching
            works, but nothing populates profiles.preferred_language yet, so a
            segmented send reaches nobody until users are tagged.
          */}
          <span className="text-[10px] text-lo">
            Optional language code (e.g. <code className="text-mid">ta</code>,{' '}
            <code className="text-mid">en</code>) to target one segment. Note: no users have a
            language preference set yet, so a segmented send will reach nobody — leave blank to
            reach everyone.
          </span>
        </label>

        {result && (
          <p
            role="status"
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${
              result.ok
                ? 'border-brand/40 bg-brand/10 text-hi'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            }`}
          >
            {result.ok ? <CircleCheck className="size-4 shrink-0" /> : <CircleAlert className="size-4 shrink-0" />}
            {result.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSend}
          className="btn-primary inline-flex items-center justify-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {sending ? 'Sending…' : 'Send to all users'}
        </button>
      </form>

      {/* Recent sends — a cheap guard against double-broadcasting. */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-mid">Recent announcements</h3>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-lo" role="status">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : sent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-edge px-4 py-8 text-center text-sm text-lo">
            No announcements sent yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sent.map((a) => (
              <li key={a.id} className="rounded-xl border border-edge bg-panel p-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-hi">{a.title}</p>
                  <time dateTime={a.created_at} className="shrink-0 text-[11px] text-lo">
                    {timeAgo(a.created_at)}
                  </time>
                </div>
                {a.message && <p className="mt-1 line-clamp-2 text-xs text-mid">{a.message}</p>}
                <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-lo">
                  {a.link && <span className="rounded-full border border-edge px-2 py-0.5">{a.link}</span>}
                  <span className="rounded-full border border-edge px-2 py-0.5">
                    {a.segment_language ? `segment: ${a.segment_language}` : 'everyone'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
