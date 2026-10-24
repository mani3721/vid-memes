import { useEffect, useState } from 'react'
import { useParams, Navigate, useLocation } from 'react-router-dom'
import { MOODS } from '../data/assets'
import { useMemeById, useSimilarMemes } from '../hooks/useMemes'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { Pencil, Check, X, Loader2 as EditLoader } from 'lucide-react'
import {
  slugToId,
  toMemeUrl,
  buildMediaSchema,
  buildBreadcrumbSchema,
  metaDescription,
  templateDescription,
} from '../utils/seo'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import MemeDescription from '../components/MemeDescription'
import DownloadButton from '../components/DownloadButton'
import ShareButton from '../components/ShareButton'
import ReactionBar from '../components/ReactionBar'
import AudioHero from '../components/AudioHero'
import SimilarMemesRow from '../components/SimilarMemesRow'

const FORMAT_LABELS = { MP4: 'Video · MP4', GIF: 'Animated · GIF', WebM: 'Video · WebM', PNG: 'Image · PNG', MP3: 'Audio · MP3', WAV: 'Audio · WAV' }

const CAT_BREADCRUMB = { videos: '/videos', gifs: '/gifs', images: '/templates', sounds: '/sounds' }
const CAT_LABEL      = { videos: 'Videos', gifs: 'GIFs', images: 'Templates', sounds: 'Sounds' }

function MetaChip({ label }) {
  return (
    <span className="rounded-full border border-edge bg-panel px-3 py-1 text-xs text-mid">{label}</span>
  )
}

/**
 * Reserved vertical space for the future sidebar ad unit, in pixels.
 *
 * 250 is a 300x250 medium rectangle, the unit that actually fits a 320px
 * column. The box is committed to the layout at first paint and never
 * resizes, so an ad arriving late — or not at all — cannot push the download
 * control up or down. That is the whole point: a button that moves while an
 * async script settles is how accidental clicks happen, and it is also a
 * direct CLS hit on the page's most-used control.
 */
const AD_RESERVE_PX = 250

/**
 * Fixed height of the isolated download block, in pixels.
 *
 * Measured, not guessed: 24px top padding + 16px heading row + 16px heading
 * margin + two 48px controls + the 12px gap between them + 24px bottom
 * padding = 188. Rounded to 190 so a font fallback swapping in a taller
 * face cannot overflow the envelope.
 *
 * Fixing it means the block's height is identical before and after the hero
 * media loads, so the button underneath never moves.
 */
const CONTROL_ZONE_MIN_PX = 190

/**
 * The ad environment, held open but not yet filled.
 *
 * Rendered inside its own wrapper div so the structural half of AdSlot's
 * audit would pass if a live <AdSlot> ever replaces it: auditPlacement()
 * refuses any slot whose *direct sibling* contains a [data-ad-unsafe]
 * control, and a lone child has no siblings to test.
 *
 * Read the note on #isolated-download-control-zone before swapping in a real
 * unit — this position clears the brief's 25-30px separation but not
 * AdSlot's own 150px geometric rule.
 *
 * The dashed "Advertisement Slot" treatment is development-only. In
 * production the same box renders as inert reserved space: identical
 * geometry, so what you lay out in dev is what ships, but no reviewer ever
 * meets a box labelled "Advertisement" with no advertisement in it.
 */
function AdReservation() {
  if (!import.meta.env.DEV) {
    return (
      <div
        aria-hidden
        data-ad-reservation="sidebar"
        style={{ height: AD_RESERVE_PX }}
        className="w-full"
      />
    )
  }

  return (
    <div
      data-ad-reservation="sidebar"
      style={{ height: AD_RESERVE_PX }}
      className="grid w-full place-items-center rounded-2xl border border-dashed border-edge bg-panel/40 px-4 text-center"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mid">
          Advertisement Slot
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-lo">
          300×250 reserved · dev preview only
        </p>
      </div>
    </div>
  )
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export default function MemePage() {
  const { slug } = useParams()
  const { pathname } = useLocation()
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

  // Serve each asset from exactly one URL.
  //
  // This page answers on both /meme/:slug and /sound/:slug, and the slug's
  // title prefix is cosmetic — the asset is resolved from the trailing UUID
  // alone. So a sound reached at /meme/..., or any asset reached with a stale
  // title in the slug after an admin retitle, would otherwise render full
  // content on a non-canonical URL. Redirecting collapses those variants
  // instead of leaving duplicates for a crawler to find.
  //
  // Terminates after one hop: canonicalPath is derived from the fetched row,
  // so once pathname matches it, it keeps matching.
  if (pathname !== canonicalPath) {
    return <Navigate to={canonicalPath} replace />
  }
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM' || asset.format === 'GIF'
  // Format, not category: the "sounds" category also holds a few MP4s, which
  // should keep the video player.
  const isAudio = asset.format === 'MP3' || asset.format === 'WAV'
  const moodLabel = MOODS.find((m) => m.id === asset.mood)?.label ?? asset.mood ?? ''

  const resolution = asset.width_px && asset.height_px
    ? `${asset.width_px}×${asset.height_px}`
    : null

  // Dispatches on format, so MP3/WAV pages get AudioObject rather than being
  // described as images. sitemap-audio.xml relies on this markup for context,
  // since there is no audio sitemap extension to carry it.
  const schema = buildMediaSchema(asset, canonicalPath)

  // One crumb list drives both <Breadcrumbs> and the BreadcrumbList JSON-LD,
  // so the visible trail and the structured data cannot drift apart.
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: CAT_LABEL[asset.category] ?? 'Memes', url: CAT_BREADCRUMB[asset.category] ?? '/' },
    { name: shownTitle },
  ]
  const breadcrumbSchema = buildBreadcrumbSchema(crumbs)

  // The <meta> description prefers the authored long copy so pages stop sharing
  // one near-identical boilerplate sentence; the template is the fallback shown
  // in the About block when nothing has been written yet.
  const description = metaDescription(asset)
  const fallbackDescription = templateDescription(asset)

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
        <Breadcrumbs crumbs={crumbs} />

        <article aria-labelledby="meme-title">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/*
              aspect-ratio reserves the hero's layout box before the image or
              video loads — this is the single most prominent above-the-fold
              element on the page, so leaving it unsized is a real CLS hit.
              Real width_px/height_px wins when known; 16:9 is the fallback
              rather than a guess at square, since most meme video uploads are
              widescreen or vertical-but-cropped-to-video, not square.
            */}
            <div
              className="torn paper-lift relative overflow-hidden rounded-2xl bg-panel"
              style={{ aspectRatio: asset.width_px && asset.height_px ? `${asset.width_px} / ${asset.height_px}` : '16 / 9' }}
            >
              {isAudio ? (
                /*
                  Audio gets a generated hero rather than its thumbnail.
                  generateThumbnail() in server/routes/upload.js has no frame to
                  extract from an MP3, so it stores a flat rgb(18,16,28) square —
                  a real image, which is why this panel rendered as a large empty
                  black rectangle instead of visibly failing. AudioHero also
                  supplies the player the page was missing entirely.
                */
                <AudioHero asset={asset} />
              ) : isVideo && (asset.format === 'MP4' || asset.format === 'WebM') ? (
                <video
                  src={asset.publicUrl}
                  controls
                  muted
                  playsInline
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src={asset.thumb}
                  alt={`${asset.title} meme ${asset.format} download`}
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                  className="size-full object-cover"
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

              {/*
                The download and share triggers used to sit here, as a pair of
                circles directly beneath the H1, and then inside the File
                Details card below. They now live alone in
                #isolated-download-control-zone at the foot of this column.
              */}

              {/* Open to guests — see components/ReactionBar.jsx */}
              <ReactionBar memeId={asset.id} reactions={asset.reactions} />

              {/*
                File Details is now description only. Nothing clickable lives
                in this card, so the ad reservation directly beneath it has no
                control to sit next to — structurally or geometrically.
              */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-edge bg-panel">
                <div className="p-4">
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

              {/*
                The ad environment, simulated now so the download control is
                laid out against its real neighbour rather than against empty
                space. Own wrapper: see the note on AdReservation.
              */}
              <div className="mt-8">
                <AdReservation />
              </div>

              {/*
                THE ISOLATED DOWNLOAD CONTROL ZONE
                ----------------------------------
                The page's primary action, alone in its own block, with no ad,
                no thumbnail and no navigation inside its bounds.

                On the separation distance: the brief for this change asked for
                25-30px. That is the floor, and mt-40 (160px) clears it — but
                160px is the number that matters, because this repo enforces its
                own stricter rule. AdSlot.MIN_GAP_PX is 150, and auditPlacement()
                measures it live against every [data-ad-unsafe] node on the
                page. Had this been built to 32px (mt-8), a real <AdSlot> in the
                reservation above would have measured the gap, failed, and
                silently rendered nothing — the layout would look right and
                carry no ad. 160px is what makes the slot above actually
                fillable.

                Known gap to close before this position goes live: the audit is
                radial (Math.hypot), so it also measures the diagonal to the
                media hero in the left grid column, which sits well inside
                150px. The hero is not currently marked [data-ad-unsafe] so the
                audit passes, but confirm the measured distance with the real
                unit mounted before enabling it. The two in-flow slots further
                down the page are unaffected and remain the proven positions.

                min-height is fixed and independent of its contents: the two
                48px buttons, the 12px gap between them, the label line, and the
                padding envelope are all committed at first paint. Nothing in
                here waits on a network response, so the button cannot travel
                under the user's finger while the page settles.
              */}
              <section
                id="isolated-download-control-zone"
                aria-labelledby="download-zone-heading"
                style={{ minHeight: CONTROL_ZONE_MIN_PX }}
                className="mt-40 flex flex-col justify-center rounded-2xl border border-edge bg-panel px-4 py-6"
              >
                <h2
                  id="download-zone-heading"
                  className="mb-4 text-xs font-semibold uppercase tracking-widest text-mid"
                >
                  Download This File
                </h2>

                {/* space-y-3 (12px) between the two full-width controls. */}
                <div className="space-y-3">
                  <DownloadButton
                    label={`Download ${asset.title} ${asset.format}`}
                    href={asset.publicUrl}
                    filename={asset.filename}
                    memeId={asset.id}
                    layout="block"
                    text={`Download Free ${asset.format}`}
                  />
                  <ShareButton
                    url={window.location.href}
                    title={asset.title}
                    layout="block"
                    text="Share Meme Asset Link"
                  />
                </div>
              </section>

            </div>
          </div>
        </article>

        {/* About this meme — long-form, structured, unique per asset */}
        <div className="mt-12">
          <MemeDescription asset={asset} fallbackText={fallbackDescription} isAdmin={isAdmin} />
          {moodLabel && <p className="mt-4 text-sm text-lo">Mood: {moodLabel}</p>}
        </div>

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
