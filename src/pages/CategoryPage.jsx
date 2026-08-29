import { useState } from 'react'
import { Loader2, AudioLines } from 'lucide-react'
import { compact } from '../data/assets'
import { SITE_NAME } from '../utils/seo'
import { useTrendingMemes, useCategoryMemes } from '../hooks/useMemes'
import SEO from '../components/SEO'
import MasonryFeed from '../components/MasonryFeed'
import DownloadButton from '../components/DownloadButton'
import MoodPicker from '../components/MoodPicker'
import EmptyGridState from '../components/EmptyGridState'
import { useStudio } from '../store/studioStore'

const BARS = [5, 9, 14, 8, 17, 11, 6, 13, 9, 16, 7, 12, 5, 10, 15, 8]

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

  const { memes: trending, loading: trendingLoading, hasMore: tHasMore, loadMore: tLoadMore } =
    useTrendingMemes({ limit: 20 })
  const { memes: byCat, loading: catLoading, hasMore: cHasMore, loadMore: cLoadMore } =
    useCategoryMemes({
      category: DB_CATEGORY[category],
      mood: meta.hasMoodFilter ? mood : null,
      query,
      limit: 20,
    })

  const isTrending = category === 'trending'
  const memes = isTrending ? trending : byCat
  const loading = isTrending ? trendingLoading : catLoading
  const hasMore = isTrending ? tHasMore : cHasMore
  const loadMore = isTrending ? tLoadMore : cLoadMore

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
            url: `https://videsaur.co.in${canonicalPath}`,
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
          <section aria-labelledby="sfx-list-heading">
            <h2 id="sfx-list-heading" className="sr-only">Sound effects list</h2>
            {loading ? (
              <p className="py-10 text-center text-sm text-lo">Loading sounds…</p>
            ) : memes.length === 0 ? (
              <EmptyGridState category="sounds" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {memes.map((sfx) => (
                  <div
                    key={sfx.id}
                    className="flex items-center gap-3 rounded-xl border border-edge bg-panel p-4 transition-colors hover:border-brand/40 hover:bg-panel-hover"
                  >
                    <AudioLines className="size-5 shrink-0 text-brand" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-hi">{sfx.title}</p>
                      <div aria-hidden className="mt-1.5 flex h-5 items-center gap-0.5">
                        {BARS.map((h, i) => (
                          <span key={i} className="w-0.5 shrink-0 rounded-full bg-brand/60" style={{ height: `${h}px` }} />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-lo">{sfx.sizeMB} MB · {compact(sfx.editorUses)} downloads</p>
                    </div>
                    <DownloadButton
                      label={`Download ${sfx.title} sound effect`}
                      href={sfx.publicUrl}
                      filename={sfx.filename}
                      memeId={sfx.id}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {loading && memes.length === 0 ? (
              <p className="py-14 text-center text-sm text-lo">Loading…</p>
            ) : memes.length === 0 ? (
              <EmptyGridState category={meta.h1.toLowerCase()} />
            ) : (
              <>
                <MasonryFeed assets={memes} />
                {/* Sparse grid note */}
                {memes.length < 6 && !loading && (
                  <p className="text-center text-xs text-lo/60">
                    More {meta.h1.toLowerCase()} coming soon
                  </p>
                )}
              </>
            )}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-5 py-2.5 text-sm font-medium text-mid transition-colors hover:border-brand/40 hover:text-hi"
                >
                  <Loader2 className="size-4" />
                  Show more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
