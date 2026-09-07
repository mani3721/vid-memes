import { useState, useEffect } from 'react'
import {
  Share2, ExternalLink, Play, Plus,
  RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { useRedditFeed } from '../hooks/useRedditFeed'

// ─── Subreddit groups ─────────────────────────────────────────────────────────

const TAMIL_SUBS = [
  { sub: 'TamilMemes', label: 'r/TamilMemes' },
  { sub: 'kollywood',  label: 'kollywood'    },
  { sub: 'tamil',      label: 'Tamil'        },
  { sub: 'TamilNadu',  label: 'TamilNadu'    },
]

const INTL_SUBS = [
  { sub: 'memes',     label: 'Memes'  },
  { sub: 'dankmemes', label: 'Dank'   },
  { sub: 'funny',     label: 'Funny'  },
  { sub: 'gaming',    label: 'Gaming' },
  { sub: 'me_irl',    label: 'me_irl' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubredditAvatar({ name }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
      style={{ background: `hsl(${hue} 65% 45%)` }}
    >
      r/
    </div>
  )
}

function MemeCard({ post }) {
  const [imgError, setImgError] = useState(false)

  async function handleShare() {
    try { await navigator.share({ title: post.title, url: post.link }) }
    catch { navigator.clipboard?.writeText(post.link) }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-edge bg-panel transition-shadow hover:shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <SubredditAvatar name={post.subreddit || 'r'} />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-hi">r/{post.subreddit}</span>
          <span className="mx-1.5 text-lo">·</span>
          <span className="text-xs text-lo">{post.author}</span>
        </div>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full p-1.5 text-lo hover:bg-panel-hover hover:text-mid"
          title="Open on Reddit"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Title */}
      <p className="px-4 pb-3 text-sm font-semibold leading-snug text-hi line-clamp-3">
        {post.title}
      </p>

      {/* Media */}
      {post.isVideo ? (
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden bg-black"
        >
          {post.image && !imgError && (
            <img
              src={post.image}
              alt={post.title}
              className="max-h-120 w-full object-contain opacity-75 transition-opacity group-hover:opacity-50"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-bold text-black shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
              <Play className="size-4 fill-black" />
              Watch with sound on Reddit
            </div>
          </div>
        </a>
      ) : (
        post.image && !imgError && (
          <div className="overflow-hidden bg-black">
            <img
              src={post.image}
              alt={post.title}
              className="max-h-120 w-full object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        )
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 px-4 py-3">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-lo underline-offset-2 hover:text-mid hover:underline"
        >
          Reddit
        </a>
        <button
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-edge px-3.5 py-1.5 text-xs font-semibold text-mid transition-colors hover:bg-panel-hover hover:text-hi"
        >
          <Share2 className="size-3.5" />
          Share
        </button>
      </div>

    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-edge bg-panel p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="size-8 animate-pulse rounded-full bg-panel-hover" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-32 animate-pulse rounded bg-panel-hover" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-panel-hover" />
        </div>
      </div>
      <div className="mb-3 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-panel-hover" />
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-panel-hover" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-panel-hover" />
    </div>
  )
}

function SubredditGroup({ label, items, active, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-lo">
        {label}
      </span>
      {items.map(({ sub, label: name }) => (
        <button
          key={sub}
          onClick={() => onSelect(sub)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            active === sub
              ? 'btn-primary shadow-sm'
              : 'bg-panel text-mid hover:bg-panel-hover hover:text-hi'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true })
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    const meta   = document.createElement('meta')
    meta.name    = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  const [subreddit, setSubreddit] = useState('TamilMemes')

  const { posts, loading, error, fetchedAt, fromCache, refresh, loadMore } =
    useRedditFeed(subreddit)

  if (authLoading || !isAdmin) return null

  return (
    <div className="mx-auto max-w-2xl">

      {/* ── Header ── */}
      <div className="mb-5 flex items-center gap-2">
        <h1 className="flex-1 text-2xl font-bold text-hi">Meme Feed</h1>
        <button
          onClick={refresh}
          disabled={loading}
          title="Refresh"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-mid transition-colors hover:bg-panel-hover hover:text-hi disabled:opacity-40"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Subreddit tabs ── */}
      <div className="mb-6 space-y-2.5">
        <div className="overflow-x-auto scrollbar-none">
          <SubredditGroup label="தமிழ்" items={TAMIL_SUBS} active={subreddit} onSelect={setSubreddit} />
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <SubredditGroup label="Global" items={INTL_SUBS} active={subreddit} onSelect={setSubreddit} />
        </div>
      </div>

      {/* ── Error ── */}
      {error && posts.length === 0 && (
        <div className="rounded-2xl border border-edge bg-panel px-6 py-10 text-center">
          <p className="text-sm font-medium text-hi">
            {error.code === 'NOT_FOUND' ? 'Subreddit not found'  :
             error.code === 'PRIVATE'   ? 'Subreddit is private' :
             'Could not load feed'}
          </p>
          <p className="mt-1 text-xs text-lo">{error.message}</p>
          {(error.code === 'NOT_FOUND' || error.code === 'PRIVATE') && (
            <button
              onClick={() => setSubreddit('kollywood')}
              className="btn-primary mt-3 rounded-full px-4 py-1.5 text-sm font-semibold"
            >
              Try r/kollywood instead
            </button>
          )}
          <button
            onClick={refresh}
            className="mt-3 ml-2 rounded-full border border-edge px-4 py-1.5 text-sm font-semibold text-mid hover:bg-panel-hover"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && posts.length === 0 && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border border-edge bg-panel px-6 py-10 text-center">
          <p className="text-sm font-medium text-hi">No posts found</p>
          <p className="mt-1 text-xs text-lo">This subreddit may have no recent posts</p>
          <button
            onClick={refresh}
            className="mt-3 rounded-full border border-edge px-4 py-1.5 text-sm font-semibold text-mid hover:bg-panel-hover"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Post list ── */}
      {posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map(post => (
            <MemeCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* ── Load more ── */}
      {posts.length > 0 && !loading && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-edge py-3 text-sm font-semibold text-mid transition-colors hover:bg-panel-hover hover:text-hi disabled:opacity-50"
        >
          <Plus className="size-4" />
          Load more memes
        </button>
      )}

      {/* ── Footer ── */}
      {!loading && posts.length > 0 && (
        <p className="mt-4 text-center text-xs text-lo">
          {posts.length} posts ·{' '}
          {fetchedAt
            ? `${fromCache ? 'cached · ' : ''}fetched at ${fetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : ''}
          {' · '}
          <button onClick={refresh} className="underline hover:text-mid">refresh</button>
        </p>
      )}

    </div>
  )
}
