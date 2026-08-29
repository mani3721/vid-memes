import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ChevronRight, Share2 } from 'lucide-react'
import { compact, MOODS } from '../data/assets'
import { useMemeById, useCategoryMemes } from '../hooks/useMemes'
import { supabase } from '../lib/supabaseClient'
import {
  slugToId,
  toMemeUrl,
  buildVideoSchema,
  buildImageSchema,
  buildBreadcrumbSchema,
} from '../utils/seo'
import SEO from '../components/SEO'
import DownloadButton from '../components/DownloadButton'
import MasonryFeed from '../components/MasonryFeed'

const FORMAT_LABELS = { MP4: 'Video · MP4', GIF: 'Animated · GIF', WebM: 'Video · WebM', PNG: 'Image · PNG', MP3: 'Audio · MP3', WAV: 'Audio · WAV' }

const CAT_BREADCRUMB = { videos: '/videos', gifs: '/gifs', images: '/templates', sounds: '/sounds' }
const CAT_LABEL      = { videos: 'Videos', gifs: 'GIFs', images: 'Templates', sounds: 'Sounds' }

function MetaChip({ label }) {
  return (
    <span className="rounded-full border border-edge bg-panel px-3 py-1 text-xs text-mid">{label}</span>
  )
}

export default function MemePage() {
  const { slug } = useParams()
  const id = slugToId(slug)
  const { meme: asset, loading, error } = useMemeById(id)
  const { memes: related } = useCategoryMemes({ category: asset?.category, limit: 8 })

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

  if (loading) {
    return <div className="py-24 text-center text-sm text-mid">Loading…</div>
  }
  if (error || !asset) return <Navigate to="/" replace />

  const canonicalPath = toMemeUrl(asset)
  const isVideo = asset.format === 'MP4' || asset.format === 'WebM' || asset.format === 'GIF'
  const moodLabel = MOODS.find((m) => m.id === asset.mood)?.label ?? asset.mood ?? ''

  const resolution = asset.width_px && asset.height_px
    ? `${asset.width_px}×${asset.height_px}`
    : null

  const schema = isVideo ? buildVideoSchema(asset, canonicalPath) : buildImageSchema(asset, canonicalPath)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: CAT_LABEL[asset.category] ?? 'Memes', url: CAT_BREADCRUMB[asset.category] ?? '/' },
    { name: asset.title },
  ])

  const description = `Download ${asset.title} meme free in HD. ${asset.format} format, no watermark. Perfect for WhatsApp status, Reels, Shorts, and editing.`

  const relatedFiltered = related.filter((a) => a.id !== asset.id)

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
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-mid">
          <Link to="/" className="transition-colors hover:text-hi">Home</Link>
          <ChevronRight className="size-3" />
          <Link to={CAT_BREADCRUMB[asset.category] ?? '/'} className="transition-colors hover:text-hi">
            {CAT_LABEL[asset.category] ?? 'Memes'}
          </Link>
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 text-hi">{asset.title}</span>
        </nav>

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

                <h1 id="meme-title" className="font-display text-2xl leading-tight tracking-wide text-hi sm:text-3xl">
                  {asset.title} — Download Free {asset.format}
                </h1>

                {moodLabel && (
                  <p className="mt-1.5 text-sm text-mid">{moodLabel}</p>
                )}
              </div>

              <div className="flex gap-4 text-sm text-mid">
                <span>😂 {compact(asset.reactions.laugh)}</span>
                <span>🔥 {compact(asset.reactions.fire)}</span>
                <span>💀 {compact(asset.reactions.skull)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <DownloadButton
                  label={`Download ${asset.title} ${asset.format}`}
                  href={asset.publicUrl}
                  filename={asset.filename}
                  memeId={asset.id}
                  className="gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                />
                <button
                  type="button"
                  aria-label="Share this meme"
                  className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-4 py-2.5 text-sm font-semibold text-hi transition-colors hover:border-volt hover:text-volt"
                >
                  <Share2 className="size-4" />
                  Share
                </button>
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

              <p className="text-xs leading-relaxed text-mid">{description}</p>
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

        {relatedFiltered.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-12">
            <h2 id="related-heading" className="mb-4 font-display text-lg tracking-wide text-hi sm:text-xl">
              Similar Memes You Might Like
            </h2>
            <MasonryFeed assets={relatedFiltered} />
          </section>
        )}

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
