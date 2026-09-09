import { useState } from 'react'
import { Loader2, Search, TriangleAlert, X } from 'lucide-react'
import SEO from '../components/SEO'
import StickerCard from '../components/StickerCard'
import { useGuestLanguage, useStickers } from '../hooks/useStickers'
import { BASE_URL, SITE_NAME } from '../utils/seo'

const DESCRIPTION =
  'Browse and download free stickers — transparent PNG, WebP and animated GIF. Search thousands of stickers for WhatsApp, Telegram, Discord and Slack, powered by KLIPY.'

const KEYWORDS =
  'sticker download, free stickers, transparent png stickers, whatsapp stickers download, telegram stickers, animated stickers'

export default function StickersPage() {
  const [query, setQuery] = useState('')
  const language = useGuestLanguage()

  const {
    stickers,
    loading,
    initialLoading,
    error,
    hasNext,
    loadMore,
    mode,
    activeQuery,
  } = useStickers({ query, language })

  const heading = mode === 'search' ? `Stickers for “${activeQuery}”` : 'Trending Stickers'

  return (
    <>
      <SEO
        title="Stickers — Free Transparent PNG & Animated Sticker Download"
        description={DESCRIPTION}
        keywords={KEYWORDS}
        canonicalPath="/stickers"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Stickers | ${SITE_NAME}`,
            description: DESCRIPTION,
            url: `${BASE_URL}/stickers`,
          },
        ]}
      />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-hi sm:text-3xl">
            Stickers — Free Transparent & Animated Downloads
          </h1>
        </div>

        {/* ── Search + attribution ─────────────────────────────────────────
            The placeholder reads "Search KLIPY" because KLIPY's attribution
            terms require exactly that string as the default placeholder in any
            search field over their content — it is the one REQUIRED item on
            their list. "Search stickers" is carried as the field's accessible
            name instead, so screen-reader users still get the plain-language
            description of what the box does.
            https://docs.klipy.com/attribution */}
        <div className="flex flex-col gap-2">
          <div className="flex w-full max-w-xl items-center gap-2 rounded-full border border-edge bg-panel px-4 py-2.5 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15">
            <Search className="size-4 shrink-0 text-lo" />
            <label htmlFor="sticker-search" className="sr-only">Search stickers</label>
            <input
              id="sticker-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search KLIPY"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-hi placeholder:text-lo focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear sticker search"
                className="grid size-5 shrink-0 place-items-center rounded-full text-lo transition-colors hover:text-hi"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/*
            "Powered by KLIPY" is optional in their terms but cheap, and it is
            what makes the source of this grid legible to a visitor.

            TODO before launch: swap this wordmark for the official KLIPY logo
            asset. The files are behind a Google Drive link in their docs
            (https://docs.klipy.com/attribution) and are not in the repo, so
            this renders the brand name as text rather than shipping a
            redrawn approximation of someone else's mark.
          */}
          <p className="px-1 text-xs text-lo">
            Sticker content powered by{' '}
            <a
              href="https://klipy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              KLIPY
            </a>
          </p>
        </div>

        <section aria-labelledby="sticker-grid-heading" className="flex flex-col gap-4">
          <h2 id="sticker-grid-heading" className="text-sm font-semibold uppercase tracking-[0.12em] text-mid">
            {heading}
          </h2>

          {error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-2xl border border-edge bg-panel px-6 py-14 text-center"
            >
              <TriangleAlert className="size-6 text-status-hot" />
              <p className="text-sm text-mid">{error.message}</p>
            </div>
          ) : initialLoading ? (
            <div className="flex justify-center py-16" role="status">
              <Loader2 className="size-6 animate-spin text-brand" />
              <span className="sr-only">Loading stickers…</span>
            </div>
          ) : stickers.length === 0 ? (
            <p className="py-14 text-center text-sm text-lo">
              {mode === 'search'
                ? `No stickers match “${activeQuery}”. Try a shorter or more general word.`
                : 'No trending stickers right now — check back shortly.'}
            </p>
          ) : (
            <>
              {/*
                Denser than the meme grid on purpose. Stickers are small,
                simple, mostly square images; at video-card width they look
                like blown-up thumbnails and the page turns into a lot of
                scrolling for very little content.
              */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {stickers.map((sticker, i) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    searchTerm={mode === 'search' ? activeQuery : ''}
                    priority={i < 12}
                  />
                ))}
              </div>

              {hasNext && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-full border border-brand bg-transparent px-5 py-2.5 text-sm text-brand transition-colors duration-150 hover:bg-brand/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    {loading ? 'Loading…' : 'Load more stickers'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
