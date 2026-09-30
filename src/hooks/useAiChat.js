import { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

const STORAGE_KEY = 'vidsour:ai-chat'
// Only the tail is persisted: the server caps a conversation at 30 messages
// anyway, and localStorage is a 5 MB budget shared with favorites and consent.
const PERSIST_LIMIT = 30

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
      .slice(-PERSIST_LIMIT)
  } catch {
    return []
  }
}

/**
 * Chat state over POST /api/ai-chat.
 *
 * Streams by default so the first token lands in ~1s instead of the browser
 * staring at a spinner for the whole generation — the ModelScope endpoint is
 * served from mainland China and a full answer can take 10s+.
 */
export function useAiChat() {
  const [messages, setMessages] = useState(loadHistory)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)

  // Held in a ref so `stop()` and unmount can reach the in-flight request
  // without the send callback changing identity on every render.
  const abortRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-PERSIST_LIMIT)))
    } catch {
      // Private mode / quota exceeded — history just won't survive a reload.
    }
  }, [messages])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
  }, [])

  const clear = useCallback(() => {
    stop()
    setMessages([])
    setError(null)
  }, [stop])

  const send = useCallback(async (text) => {
    const content = text.trim()
    if (!content || abortRef.current) return

    setError(null)

    // Snapshot before the placeholder is appended — the request must carry the
    // real turns only, not the empty assistant bubble the UI is about to show.
    let history = []
    setMessages((prev) => {
      history = [...prev, { role: 'user', content }]
      return [...history, { role: 'assistant', content: '' }]
    })

    const controller = new AbortController()
    abortRef.current = controller
    setStreaming(true)

    /** Rewrites the trailing assistant bubble in place as tokens arrive. */
    const updateLast = (fn) =>
      setMessages((prev) => {
        const next = [...prev]
        const last = next.length - 1
        if (next[last]?.role !== 'assistant') return prev
        next[last] = { ...next[last], content: fn(next[last].content) }
        return next
      })

    try {
      const res = await fetch(`${API_BASE}/api/ai-chat?stream=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'The AI service is unavailable right now.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let received = false

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // A network chunk can split an SSE frame, so only whole
        // blank-line-terminated frames are consumed; the rest waits.
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          const line = frame.split('\n').find((l) => l.startsWith('data:'))
          if (!line) continue

          const payload = line.slice(5).trim()
          if (payload === '[DONE]') continue

          let parsed
          try {
            parsed = JSON.parse(payload)
          } catch {
            continue
          }

          // The server can report a mid-stream failure in-band, after the
          // 200 headers have already gone out.
          if (parsed.error) throw new Error(parsed.error)
          if (parsed.delta) {
            received = true
            updateLast((prevText) => prevText + parsed.delta)
          }
        }
      }

      if (!received) throw new Error('The AI returned an empty response.')
    } catch (err) {
      if (err.name === 'AbortError') {
        // User pressed Stop — keep whatever streamed in, drop an empty bubble.
        setMessages((prev) =>
          prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1].content
            ? prev.slice(0, -1)
            : prev,
        )
      } else {
        setError(err.message)
        setMessages((prev) =>
          prev[prev.length - 1]?.role === 'assistant' && !prev[prev.length - 1].content
            ? prev.slice(0, -1)
            : prev,
        )
      }
    } finally {
      abortRef.current = null
      setStreaming(false)
    }
  }, [])

  /** Drops the failed turn's question back so it can be sent again. */
  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    setMessages((prev) => {
      const idx = prev.map((m) => m.role).lastIndexOf('user')
      return idx === -1 ? prev : prev.slice(0, idx)
    })
    // State updates are batched, so send() reads the trimmed history next tick.
    queueMicrotask(() => send(lastUser.content))
  }, [messages, send])

  return { messages, streaming, error, send, stop, clear, retry }
}
