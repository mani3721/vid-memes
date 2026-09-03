import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import SEO from '../components/SEO'
import AdSlot from '../components/AdSlot'
import Breadcrumbs from '../components/Breadcrumbs'
import { useBlogPosts } from '../hooks/useBlog'
import { BASE_URL, SITE_NAME } from '../utils/seo'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogIndexPage() {
  const { posts, loading, error } = useBlogPosts()

  // Blog/CollectionPage schema, so the index is understood as a post listing
  // rather than another category feed.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    url: `${BASE_URL}/blog`,
    blogPost: posts.slice(0, 20).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${BASE_URL}/blog/${post.slug}`,
      ...(post.published_at ? { datePublished: post.published_at } : {}),
      ...(post.excerpt ? { description: post.excerpt } : {}),
    })),
  }

  return (
    <>
      <SEO
        title="Blog — Meme Round-Ups, Guides & Trends"
        description="Weekly meme round-ups, format guides and trend breakdowns from Videsaur. Find the clips worth downloading and how creators are using them."
        canonicalPath="/blog"
        schemas={[schema]}
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Breadcrumbs crumbs={[{ name: 'Home', url: '/' }, { name: 'Blog' }]} />

        <h1 className="font-display text-2xl tracking-wide text-hi sm:text-3xl">BLOG</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-mid">
          Round-ups, format guides and trend notes — what is spreading, why, and which
          clips are worth keeping in your edit folder.
        </p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-brand" /></div>
        ) : error ? (
          <p className="py-20 text-center text-sm text-mid">Could not load posts right now.</p>
        ) : posts.length === 0 ? (
          <p className="py-20 text-center text-sm text-mid">No posts published yet — check back soon.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex gap-4 rounded-2xl border border-edge bg-panel p-4 transition-colors hover:border-brand/40"
                >
                  {post.cover_url && (
                    <img
                      src={post.cover_url} alt="" loading="lazy"
                      className="hidden size-24 shrink-0 rounded-xl object-cover sm:block"
                    />
                  )}
                  <div className="min-w-0">
                    <h2 className="font-display text-base tracking-wide text-hi sm:text-lg">{post.title}</h2>
                    {post.published_at && (
                      <p className="mt-0.5 text-xs text-lo">{formatDate(post.published_at)}</p>
                    )}
                    {post.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mid">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Own container: see the note in MemePage about AdSlot's sibling audit. */}
        <div>
          <AdSlot context="pre-footer" />
        </div>
      </div>
    </>
  )
}
