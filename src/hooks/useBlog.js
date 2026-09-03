import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Public blog reads.
 *
 * Queries Supabase directly with the anon key, the same way useMemes does. The
 * RLS policy on blog_posts exposes only `status = 'published'`, so drafts and
 * removed posts cannot leak even though the filter is also stated here.
 */

const LIST_COLUMNS = 'id, slug, title, excerpt, cover_url, published_at'

export function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    supabase
      .from('blog_posts')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setPosts(data ?? [])
        setLoading(false)
      })

    return () => { active = false }
  }, [])

  return { posts, loading, error }
}

export function useBlogPost(slug) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return undefined
    let active = true

    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setPost(data ?? null)
        setLoading(false)
      })

    return () => { active = false }
  }, [slug])

  return { post, loading, error }
}
