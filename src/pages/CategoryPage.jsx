import { Loader2 } from 'lucide-react'
import { BASE_URL, SITE_NAME } from '../utils/seo'
import { useCategoryMemes } from '../hooks/useMemes'
import SEO from '../components/SEO'
import MasonryFeed from '../components/MasonryFeed'
import MoodPicker from '../components/MoodPicker'
import EmptyGridState from '../components/EmptyGridState'
import SoundCard from '../components/SoundCard'
import { useStudio } from '../store/studioStore'

const DB_CATEGORY = { trending: null, videos: 'videos', gifs: 'gifs', templates: 'images', sounds: 'sounds' }

const CATEGORY_META = {
  trending: {
    h1: 'Trending Memes',
    pageH1: 'Trending Memes — Viral & Hot Free Downloads',
    description: 'Browse and download trending meme videos, GIFs, and templates in HD. Updated daily — the freshest memes on the internet, no watermark, no sign-up.',
    keywords: 'trending memes download, viral memes free download, hot memes, trending meme video download',
    hasMoodFilter: false,
  },
  videos: {
    h1: 'Video Memes',
    pageH1: 'Video Memes — Free MP4 & WebM Download',
    description: 'Download free HD meme videos in MP4 and WebM. No watermark, no sign-up. Perfect for Reels, Shorts, WhatsApp Status, and video editing.',
    keywords: 'meme video download, mp4 meme download, funny video download free, no watermark meme video, hd meme download',
    hasMoodFilter: true,
  },
  gifs: {
    h1: 'GIF Memes',
    pageH1: 'GIF Memes — Free Animated GIF Download',
    description: 'Download free animated GIF memes in HD. No watermark, no sign-up. Loop-ready for Discord, Slack, WhatsApp, and social media.',
    keywords: 'meme gif download, funny gif download free, animated meme gif, download gif memes no watermark',
    hasMoodFilter: true,
  },
  templates: {
    h1: 'Meme Templates',
    pageH1: 'Meme Templates — Free Blank PNG Download',
    description: 'Download free blank meme templates in PNG. Transparent backgrounds, alpha channel support. Ready for CapCut, Premiere Pro, and any meme maker.',
    keywords: 'blank meme templates download, meme template png, free meme templates, transparent meme png download',
    hasMoodFilter: false,
  },
  sounds: {
    h1: 'Meme Sounds',
    pageH1: 'Meme Sound Effects — Free SFX Download',
    description: 'Download free meme sound effects and SFX. Vine boom, bruh sound, meme audio clips for CapCut, Premiere Pro, TikTok, Reels, and YouTube. No watermark, royalty-free.',
    keywords: 'meme sound effects download, meme sfx free, meme soundboard download, vine boom download, royalty free meme sounds',
    hasMoodFilter: false,
  },
}

export default function CategoryPage({ category }) {
  const meta = CATEGORY_META[category]
  const { mood, query } = useStudio()

  // CategoryPage is only routed for videos/gifs/templates/sounds — /trending has
  // its own page — so this is the single source for the feed.
  const { memes, loading, page, totalPages, setPage } = useCategoryMemes({
    category: DB_CATEGORY[category],
    mood: meta.hasMoodFilter ? mood : null,
    query,
    limit: 20,
  })

  const canonicalPath = `/${category}`

  return (
    <>
      <SEO
        title={meta.pageH1 ?? `${meta.h1} — Free Download`}
        description={meta.description}
        keywords={meta.keywords}
        canonicalPath={canonicalPath}
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${meta.h1} | ${SITE_NAME}`,
            description: meta.description,
            url: `${BASE_URL}${canonicalPath}`,
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="font-display text-2xl tracking-wide text-hi sm:text-3xl">
            {meta.pageH1 ?? meta.h1}
          </h1>
        </div>

        {meta.hasMoodFilter && <MoodPicker />}

        {category === 'sounds' ? (
          <SoundsGrid memes={memes} loading={loading} page={page} totalPages={totalPages} onPageChange={setPage} />
        ) : (
          <>
            {loading && memes.length === 0 ? (
              <p className="py-14 text-center text-sm text-lo">Loading…</p>
            ) : memes.length === 0 ? (
              <EmptyGridState category={meta.h1.toLowerCase()} />
            ) : (
              <>
                <MasonryFeed assets={memes} page={page} totalPages={totalPages} onPageChange={setPage} />
                {memes.length < 6 && !loading && (
                  <p className="text-center text-xs text-lo/60">
                    More {meta.h1.toLowerCase()} coming soon
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

// ── Sounds grid with page-based pagination ───────────────────────────────────

function SoundsGrid({ memes, loading, page, totalPages, onPageChange }) {
  if (loading && memes.length === 0) {
    return (
      <div className="flex justify-center py-16" role="status">
        <Loader2 className="size-6 animate-spin text-brand" />
        <span className="sr-only">Loading sounds…</span>
      </div>
    )
  }

  if (!loading && memes.length === 0) {
    return <EmptyGridState category="sounds" />
  }

  function handlePageChange(next) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onPageChange?.(next)
  }

  return (
    <section aria-labelledby="sfx-list-heading">
      <h2 id="sfx-list-heading" className="sr-only">Sound effects list</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {memes.map((sfx, i) => (
          <SoundCard key={sfx.id} sfx={sfx} stagger={i % 3} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="rounded-full border border-edge bg-transparent px-4 py-2 text-sm text-mid transition-colors duration-150 hover:bg-panel-hover hover:text-hi active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-lo">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="rounded-full border border-brand bg-transparent px-4 py-2 text-sm text-brand transition-colors duration-150 hover:bg-brand/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}
