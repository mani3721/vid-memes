import { useEffect, useState } from 'react'

/**
 * Public blog reads, through the API server (server/routes/blog.js), which
 * reads Appwrite and returns only `status = 'published'` posts.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

function getJson(path) {
  return fetch(`${API_BASE}${path}`).then((r) => {
    if (r.status === 404) return {}
    return r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
  })
}

export function useBlogPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    getJson('/api/blog')
      .then(({ posts: rows }) => { if (active) setPosts(rows ?? []) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })

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

    getJson(`/api/blog/${encodeURIComponent(slug)}`)
      .then(({ post: row }) => { if (active) setPost(row ?? null) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [slug])

  return { post, loading, error }
}
