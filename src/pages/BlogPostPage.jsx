import { Navigate, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import AdSlot from '../components/AdSlot'
import Breadcrumbs from '../components/Breadcrumbs'
import RichContent from '../components/RichContent'
import { useBlogPost } from '../hooks/useBlog'
import { BASE_URL, SITE_NAME, buildBreadcrumbSchema } from '../utils/seo'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const { post, loading, error } = useBlogPost(slug)

  if (loading) return <div className="py-24 text-center text-sm text-mid">Loading…</div>
  // A draft, a removed post or a bad slug all look the same from out here, which
  // is what we want — no signal about unpublished content.
  if (error || !post) return <Navigate to="/blog" replace />

  const canonicalPath = `/blog/${post.slug}`
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: post.title }]

  const description =
    post.excerpt?.trim() ||
    `${post.title} — a round-up from the ${SITE_NAME} blog.`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    url: `${BASE_URL}${canonicalPath}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}${canonicalPath}` },
    ...(post.cover_url ? { image: post.cover_url } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.updated_at ? { dateModified: post.updated_at } : {}),
    author: { '@type': 'Organization', name: 'Admin', url: BASE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL },
  }

  return (
    <>
      <SEO
        title={post.title}
        description={description}
        canonicalPath={canonicalPath}
        ogType="article"
        ogImage={post.cover_url ?? undefined}
        schemas={[schema, buildBreadcrumbSchema(crumbs)]}
      />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Breadcrumbs crumbs={crumbs} />

        <article className="mt-4">
          <header className="border-b border-edge pb-6">
            <h1 className="font-display text-3xl leading-tight tracking-wide text-hi sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-base leading-relaxed text-mid sm:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-lo">
              <span>
                By <span className="font-semibold text-hi">Admin</span>
              </span>
              {post.published_at && (
                <>
                  <span aria-hidden="true">•</span>
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </>
              )}
            </div>
          </header>

          {post.cover_url && (
            <figure className="mt-7 overflow-hidden rounded-2xl border border-edge bg-panel">
              <img
                src={post.cover_url}
                alt={`Cover image for ${post.title}`}
                loading="eager"
                fetchPriority="high"
                className="aspect-video w-full object-cover"
              />
            </figure>
          )}

          <RichContent source={post.body} className="mt-8" />
        </article>

        {/* In-flow slot after the article body. */}
        <div>
          <AdSlot context="article" />
        </div>
      </div>
    </>
  )
}
