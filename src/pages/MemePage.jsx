import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { compact, MOODS } from '../data/assets'
import { useMemeById, useSimilarMemes } from '../hooks/useMemes'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { Pencil, Check, X, Loader2 as EditLoader } from 'lucide-react'
import {
  slugToId,
  toMemeUrl,
  buildMediaSchema,
  buildBreadcrumbSchema,
} from '../utils/seo'
import SEO from '../components/SEO'
import DownloadButton from '../components/DownloadButton'
import ShareButton from '../components/ShareButton'
import SimilarMemesRow from '../components/SimilarMemesRow'

const FORMAT_LABELS = { MP4: 'Video · MP4', GIF: 'Animated · GIF', WebM: 'Video · WebM', PNG: 'Image · PNG', MP3: 'Audio · MP3', WAV: 'Audio · WAV' }

const CAT_BREADCRUMB = { videos: '/videos', gifs: '/gifs', images: '/templates', sounds: '/sounds' }
const CAT_LABEL      = { videos: 'Videos', gifs: 'GIFs', images: 'Templates', sounds: 'Sounds' }

function MetaChip({ label }) {
  return (
    <span className="rounded-full border border-edge bg-panel px-3 py-1 text-xs text-mid">{label}</span>
  )
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export default function MemePage() {
  const { slug } = useParams()
  const id = slugToId(slug)
  const { meme: asset, loading, error } = useMemeById(id)
  const { user, isAdmin } = useAuth()
  const [editingTitle, setEditingTitle] = useState(null) // null = view, string = editing
  const [titleSaving, setTitleSaving] = useState(false)
  const [displayTitle, setDisplayTitle] = useState(null) // override after save
  const { memes: similar, loading: similarLoading } = useSimilarMemes({
    category: asset?.category,
    moodTags: asset?.mood_tags ?? [],
    excludeId: asset?.id,
    limit: 14,
  })

  // Track view — fire-and-forget RPC, once per session per meme
  useEffect(() => {
    if (!id) return
    const key = `videsaur_view_${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    supabase
      .rpc('increment_view_count', { meme_id: id })
      .then(({ error: err }) => { if (err) console.warn('[view]', err.message) })
  }, [id])

  async function saveTitle() {
    const title = (editingTitle ?? '').trim()
    if (!title || title === (displayTitle ?? asset?.title)) { setEditingTitle(null); return }
    setTitleSaving(true)
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession()
      const token = freshSession?.access_token
      if (!token) return
      const res = await fetch(`${API_BASE}/api/admin/rename/${asset.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (res.ok) { setDisplayTitle(title); setEditingTitle(null) }
    } finally {
      setTitleSaving(false)
    }
  }

  if (loading) {
    return <div className="py-24 text-center text-sm text-mid">Loading…</div>
  }
  if (error || !asset) return <Navigate to="/" replace />

  const canEditTitle = isAdmin || user?.id === asset.uploader_id
  const shownTitle = displayTitle ?? asset.title
  const canonicalPath = toMemeUrl(asset)
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM' || asset.format === 'GIF'
  const moodLabel = MOODS.find((m) => m.id === asset.mood)?.label ?? asset.mood ?? ''

  const resolution = asset.width_px && asset.height_px
    ? `${asset.width_px}×${asset.height_px}`
    : null

  // Dispatches on format, so MP3/WAV pages get AudioObject rather than being
  // described as images. sitemap-audio.xml relies on this markup for context,
  // since there is no audio sitemap extension to carry it.
  const schema = buildMediaSchema(asset, canonicalPath)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: CAT_LABEL[asset.category] ?? 'Memes', url: CAT_BREADCRUMB[asset.category] ?? '/' },
    { name: asset.title },
  ])

  const description = `Download ${asset.title} meme free in HD. ${asset.format} format, no watermark. Perfect for WhatsApp status, Reels, Shorts, and editing.`

  return (
    <>
      <SEO
        title={`${asset.title} — Download Free ${asset.format} Meme`}
        description={description}
        keywords={`${asset.title}, meme download, ${asset.format.toLowerCase()} meme, free meme download, no watermark`}
        canonicalPath={canonicalPath}
        ogImage={asset.thumb}
        ogType={isVideo ? 'video.other' : 'website'}
        schemas={[schema, breadcrumbSchema]}
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <article aria-labelledby="meme-title">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="torn paper-lift relative overflow-hidden rounded-2xl bg-panel">
              {isVideo && (asset.format === 'MP4' || asset.format === 'WebM') ? (
                <video
                  src={asset.publicUrl}
                  controls
                  muted
                  playsInline
                  className="w-full object-cover"
                />
              ) : (
                <img
                  src={asset.thumb}
                  alt={`${asset.title} meme ${asset.format} download`}
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <MetaChip label={FORMAT_LABELS[asset.format] ?? asset.format} />
                  <MetaChip label={asset.license} />
                  {asset.hasAlpha && <MetaChip label="Alpha Channel" />}
                  {asset.greenScreen && <MetaChip label="Green Screen" />}
                </div>

                {editingTitle !== null ? (
                  <div className="flex items-start gap-2">
                    <input
                      autoFocus
                      type="text"
                      maxLength={200}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle()
                        if (e.key === 'Escape') setEditingTitle(null)
                      }}
                      className="flex-1 rounded-xl border border-brand/50 bg-base px-3 py-2 font-display text-xl tracking-wide text-hi outline-none focus:border-brand"
                    />
                    <button type="button" onClick={saveTitle} disabled={titleSaving}
                      className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand/15 text-brand hover:bg-brand/25 disabled:opacity-50"
                      aria-label="Save title">
                      {titleSaving ? <EditLoader className="size-4 animate-spin" /> : <Check className="size-4" />}
                    </button>
                    <button type="button" onClick={() => setEditingTitle(null)}
                      className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-panel-hover text-mid hover:text-hi"
                      aria-label="Cancel">
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="group/title flex items-start gap-2">
                    <h1 id="meme-title" className="flex-1 font-display text-2xl leading-tight tracking-wide text-hi sm:text-3xl">
                      {shownTitle} — Download Free {asset.format}
                    </h1>
                    {canEditTitle && (
                      <button type="button" onClick={() => setEditingTitle(shownTitle)}
                        className="mt-1 shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100"
                        aria-label="Edit title">
                        <Pencil className="size-4 text-mid hover:text-hi" />
                      </button>
                    )}
                  </div>
                )}

                {moodLabel && (
                  <p className="mt-1.5 text-sm text-mid">{moodLabel}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DownloadButton
                  label={`Download ${asset.title} ${asset.format}`}
                  href={asset.publicUrl}
                  filename={asset.filename}
                  memeId={asset.id}
                  className="gap-2 rounded-full py-2.5 text-sm font-semibold"
                />
                <ShareButton
                  url={window.location.href}
                  title={asset.title}
                  size="md"
                  variant="solid"
                />
              </div>

              <div className="rounded-2xl border border-edge bg-panel p-4">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-mid">File Details</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ['Format', asset.format],
                    resolution && ['Resolution', resolution],
                    ['Size', `${asset.sizeMB} MB`],
                    ['License', asset.license],
                    ['Category', asset.category],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-mid">{k}</dt>
                      <dd className="font-semibold text-hi">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

            </div>
          </div>
        </article>

        {/* About this meme */}
        <section aria-labelledby="about-meme-heading" className="mt-12">
          <h2 id="about-meme-heading" className="mb-3 font-display text-lg tracking-wide text-hi sm:text-xl">
            About This Meme
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-mid">{description}</p>
          {moodLabel && (
            <p className="mt-2 text-sm text-lo">Mood: {moodLabel}</p>
          )}
        </section>

        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="mb-4 font-display text-lg tracking-wide text-hi sm:text-xl">
            You Might Also Like
          </h2>
          <SimilarMemesRow memes={similar} loading={similarLoading} />
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mt-12">
          <h2 id="faq-heading" className="mb-6 font-display text-lg tracking-wide text-hi sm:text-xl">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {[
              {
                q: `Can I download "${asset.title}" for free?`,
                a: `Yes — ${asset.title} is completely free to download in ${asset.format} format. No watermark, no sign-up, and no hidden fees.`,
              },
              {
                q: `Is "${asset.title}" royalty-free?`,
                a: `${asset.title} is licensed as ${asset.license}. Always review the specific license terms before using it in commercial projects.`,
              },
              {
                q: `What format is "${asset.title}" available in?`,
                a: `${asset.title} is available as a ${asset.format} file${resolution ? ` at ${resolution} resolution` : ''}. Download it and use it in any video editor, social media app, or meme maker.`,
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <dt>
                  <h3 className="text-base font-semibold text-hi">{q}</h3>
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-mid">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
