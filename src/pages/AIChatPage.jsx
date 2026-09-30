import { useEffect, useRef, useState } from 'react'
import {
  Bot, Send, Square, Trash2, RotateCcw, AlertCircle, User, Sparkles,
} from 'lucide-react'
import SEO from '../components/SEO'
import Markdown from '../components/Markdown'
import { useAiChat } from '../hooks/useAiChat'
import { BASE_URL, SITE_NAME } from '../utils/seo'

const DESCRIPTION =
  'Chat with the Vidsour AI assistant — get meme caption ideas, find the right template or sound, and get quick answers about editing and downloading.'

const KEYWORDS =
  'ai meme assistant, meme caption generator, ai chat, meme ideas, vidsour ai'

const SUGGESTIONS = [
  'Write 5 captions for a "cat knocks over laptop" meme',
  'What sound fits a dramatic slow-motion fail clip?',
  'Give me a meme idea about Monday mornings',
  'How do I download a GIF without a watermark?',
]

const MAX_CHARS = 4000

function Bubble({ role, content, pending }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`grid size-8 shrink-0 place-items-center rounded-full ${
          isUser ? 'bg-panel-hover text-mid' : 'bg-brand/15 text-brand'
        }`}
        aria-hidden
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div
        className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
          isUser
            ? 'rounded-tr-sm bg-brand/15 text-hi'
            : 'rounded-tl-sm border border-edge bg-panel'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content}</p>
        ) : content ? (
          /* Model output is untrusted text — Markdown renders React elements
             only and never dangerouslySetInnerHTML, so a prompt-injected
             <script> or javascript: link stays inert literal text. */
          <Markdown source={content} className="space-y-2.5 [&>p]:text-hi" />
        ) : (
          <span className="flex gap-1 py-1" role="status" aria-label="Thinking">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="size-1.5 animate-bounce rounded-full bg-lo"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
        )}

        {pending && content && (
          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-brand align-middle" />
        )}
      </div>
    </div>
  )
}

export default function AIChatPage() {
  const { messages, streaming, error, send, stop, clear, retry } = useAiChat()
  const [draft, setDraft] = useState('')

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Follow the stream, but only while the user is already near the bottom —
  // yanking the viewport down while they scroll back to re-read an answer is
  // the single most annoying thing a chat UI can do.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (nearBottom) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = (e) => {
    e?.preventDefault()
    if (!draft.trim() || streaming) return
    send(draft)
    setDraft('')
    inputRef.current?.focus()
  }

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter breaks the line — the convention every chat
    // client shares, so it needs no affordance.
    if (e.key === 'Enter' && !e.shiftKey) submit(e)
  }

  const empty = messages.length === 0

  return (
    <>
      <SEO
        title="AI Chat — Meme Ideas, Captions & Help"
        description={DESCRIPTION}
        keywords={KEYWORDS}
        canonicalPath="/ai-chat"
        schemas={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: `AI Chat | ${SITE_NAME}`,
            applicationCategory: 'MultimediaApplication',
            description: DESCRIPTION,
            url: `${BASE_URL}/ai-chat`,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        ]}
      />

      <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 font-display text-2xl tracking-wide text-hi sm:text-3xl">
              <Sparkles className="size-5 shrink-0 text-brand" />
              AI Chat
            </h1>
            <p className="mt-1 text-sm text-mid">
              Caption ideas, meme brainstorms and quick answers about the site.
            </p>
          </div>

          {!empty && (
            <button
              type="button"
              onClick={clear}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-xs font-medium text-mid transition-colors hover:bg-panel-hover hover:text-hi"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Clear chat</span>
            </button>
          )}
        </div>

        {/* ── Transcript ───────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-5 overflow-y-auto rounded-2xl border border-edge bg-canvas p-4 sm:p-5"
          // Streamed tokens are appended continuously; "polite" would make a
          // screen reader read the half-finished answer over and over.
          aria-live="off"
        >
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-brand/15 text-brand">
                <Bot className="size-6" />
              </div>
              <div>
                <p className="font-display text-lg tracking-wide text-hi">Ask me anything</p>
                <p className="mt-1 text-sm text-mid">Start with one of these:</p>
              </div>
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-edge bg-panel px-3 py-2.5 text-left text-xs leading-relaxed text-mid transition-colors hover:border-brand/50 hover:bg-panel-hover hover:text-hi"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                pending={streaming && i === messages.length - 1 && m.role === 'assistant'}
              />
            ))
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-hi"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1">
                <p className="break-words">{error}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  <RotateCcw className="size-3" />
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Composer ─────────────────────────────────────────────── */}
        <form onSubmit={submit} className="pt-3">
          <div className="flex items-end gap-2 rounded-2xl border border-edge bg-panel px-3 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15">
            <label htmlFor="ai-chat-input" className="sr-only">Message the AI assistant</label>
            <textarea
              id="ai-chat-input"
              ref={inputRef}
              rows={1}
              value={draft}
              maxLength={MAX_CHARS}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask for a caption, a meme idea, or help…"
              className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm text-hi placeholder:text-lo focus:outline-none"
            />

            {streaming ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-panel-hover text-hi transition-colors hover:bg-edge"
              >
                <Square className="size-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send message"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            )}
          </div>

          <p className="mt-2 px-1 text-[11px] text-lo">
            AI can make mistakes — double-check anything important. Enter to send, Shift+Enter for a new line.
          </p>
        </form>
      </div>
    </>
  )
}
