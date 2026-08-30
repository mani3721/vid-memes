import { useRef, useState } from 'react'
import {
  UploadCloud, X, CheckCircle2, AlertCircle,
  FileVideo, FileImage, Music, Clock, LogIn, Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from './SEO'
import { useAuth } from '../lib/authContext'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

const ACCEPTED = '.mp4,.m4v,.mov,.webm,.gif,.png,.jpg,.jpeg,.webp,.mp3,.wav'
const MAX_FILES = 20
const MOOD_OPTIONS = [
  { id: 'laugh',     label: '😂 Funny'     },
  { id: 'savage',    label: '🔥 Savage'    },
  { id: 'cursed',    label: '💀 Cursed'    },
  { id: 'wholesome', label: '😢 Wholesome' },
  { id: 'nostalgic', label: '🐸 Nostalgic' },
]
const CATEGORY_OPTIONS = ['videos', 'gifs', 'images', 'sounds']
const LICENSE_OPTIONS = [
  { value: 'CC0',       label: 'CC0 — Public Domain (commercial use OK)' },
  { value: 'Editorial', label: 'Editorial — Non-commercial / Transformative use' },
]

function detectCategory(mime) {
  if (!mime) return ''
  if (mime === 'image/gif') return 'gifs'
  if (mime.startsWith('video/')) return 'videos'
  if (mime.startsWith('image/')) return 'images'
  if (mime.startsWith('audio/')) return 'sounds'
  return ''
}

function fileIcon(mime) {
  if (!mime) return UploadCloud
  if (mime.startsWith('video/') || mime === 'image/gif') return FileVideo
  if (mime.startsWith('image/')) return FileImage
  if (mime.startsWith('audio/')) return Music
  return UploadCloud
}

function titleFromFilename(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
}

let _id = 0
function makeEntry(file) {
  return {
    id: ++_id,
    file,
    title: titleFromFilename(file.name),
    category: detectCategory(file.type),
    status: 'idle',       // idle | uploading | success | pending | error
    progress: 0,
    error: '',
    result: null,
  }
}

export default function UploadForm() {
  const { user, session, loading: authLoading } = useAuth()
  const [entries, setEntries] = useState([])
  const [sharedMoods, setSharedMoods] = useState([])
  const [sharedLicense, setSharedLicense] = useState('CC0')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  function addFiles(fileList) {
    const incoming = Array.from(fileList).slice(0, MAX_FILES - entries.length)
    if (!incoming.length) return
    setEntries(prev => [...prev, ...incoming.map(makeEntry)])
  }

  function handleDrop(e) {
    e.preventDefault()
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function patchEntry(id, patch) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }

  function toggleMood(id) {
    setSharedMoods(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id],
    )
  }

  async function uploadOne(entry) {
    patchEntry(entry.id, { status: 'uploading', progress: 0, error: '' })

    const fd = new FormData()
    fd.append('file', entry.file)
    fd.append('title', entry.title.trim())
    fd.append('category', entry.category)
    fd.append('license', sharedLicense)
    if (sharedMoods.length) fd.append('mood_tags', sharedMoods.join(','))

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable)
          patchEntry(entry.id, { progress: Math.round((ev.loaded / ev.total) * 95) })
      })
      xhr.addEventListener('load', () => {
        patchEntry(entry.id, { progress: 100 })
        if (xhr.status === 201) {
          const body = JSON.parse(xhr.responseText)
          patchEntry(entry.id, {
            status: body.pendingApproval ? 'pending' : 'success',
            result: body.meme,
          })
        } else {
          const msg = JSON.parse(xhr.responseText)?.error ?? 'Upload failed'
          patchEntry(entry.id, { status: 'error', error: msg })
        }
        resolve()
      })
      xhr.addEventListener('error', () => {
        patchEntry(entry.id, { status: 'error', error: 'Network error — check your connection.' })
        resolve()
      })
      xhr.open('POST', `${API_BASE}/api/upload`)
      if (session?.access_token)
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
      xhr.send(fd)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const queue = entries.filter(
      en => en.status === 'idle' && en.title.trim() && en.category,
    )
    if (!queue.length) return
    setUploading(true)
    for (const entry of queue) await uploadOne(entry)
    setUploading(false)
  }

  const idleCount = entries.filter(en => en.status === 'idle').length
  const canSubmit = !uploading && entries.some(
    en => en.status === 'idle' && en.title.trim() && en.category,
  )

  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center gap-5 py-20 text-center">
        <LogIn className="size-12 text-mid" />
        <div>
          <p className="text-xl font-semibold text-hi">Sign in to upload</p>
          <p className="mt-1 text-sm text-mid">You need an account to share content on Videsaur.</p>
        </div>
        <Link
          to="/login"
          className="rounded-full bg-volt px-6 py-2.5 text-sm font-semibold text-hi transition-colors hover:bg-volt-hi"
        >
          Sign in / Create account
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Upload a Meme — Videsaur"
        description="Upload your meme video, GIF, template, or sound effect to Videsaur. Free, no watermark. Supports MP4, WebM, GIF, PNG, MP3 and more."
        canonicalPath="/upload"
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5 pb-20">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-hi sm:text-3xl">UPLOAD MEMES</h1>
          <p className="mt-1 text-sm text-mid">
            MP4 / WebM / GIF up to 50 MB · PNG / JPG up to 10 MB · MP3 / WAV up to 20 MB · up to {MAX_FILES} files at once
          </p>
        </div>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="File drop zone — click or drag files here"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-edge p-8 transition-colors hover:border-volt/50"
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="sr-only"
            onChange={e => e.target.files?.length && addFiles(e.target.files)}
          />
          <UploadCloud className="size-10 text-mid" />
          <p className="text-sm text-mid">
            <span className="font-semibold text-hi">Click to browse</span> or drag &amp; drop
            {entries.length > 0 && entries.length < MAX_FILES && (
              <span className="text-lo"> · {MAX_FILES - entries.length} more allowed</span>
            )}
          </p>
        </div>

        {/* Per-file rows */}
        {entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => {
              const Icon = fileIcon(entry.file.type)
              const done = entry.status === 'success' || entry.status === 'pending'
              const isErr = entry.status === 'error'
              const isUploading = entry.status === 'uploading'

              return (
                <div
                  key={entry.id}
                  className={[
                    'rounded-2xl border p-4 transition-colors',
                    done
                      ? 'border-volt/40 bg-volt/5'
                      : isErr
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-edge bg-panel',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={['mt-0.5 size-5 shrink-0', done ? 'text-volt' : 'text-mid'].join(' ')} />

                    <div className="min-w-0 flex-1 space-y-2.5">
                      {/* Filename + size */}
                      <div className="flex items-baseline gap-2">
                        <span className="truncate text-xs text-mid">{entry.file.name}</span>
                        <span className="shrink-0 text-xs text-lo">
                          {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>

                      {/* Title input or final title */}
                      {done ? (
                        <p className="text-sm font-semibold text-hi">{entry.title}</p>
                      ) : (
                        <input
                          type="text"
                          maxLength={200}
                          value={entry.title}
                          onChange={e => patchEntry(entry.id, { title: e.target.value })}
                          disabled={isUploading}
                          className="w-full rounded-xl border border-edge bg-base px-3 py-2 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt disabled:opacity-60"
                          placeholder="Title"
                        />
                      )}

                      {/* Category chips */}
                      {!done && (
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_OPTIONS.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              disabled={isUploading}
                              onClick={() => patchEntry(entry.id, { category: cat })}
                              className={[
                                'rounded-full border px-2.5 py-1 text-xs font-semibold capitalize transition-colors disabled:opacity-60',
                                entry.category === cat
                                  ? 'border-volt bg-volt/10 text-hi'
                                  : 'border-edge text-mid hover:border-volt/50 hover:text-hi',
                              ].join(' ')}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Progress bar */}
                      {isUploading && (
                        <div>
                          <div className="mb-1 flex justify-between text-xs text-mid">
                            <span>Uploading…</span>
                            <span>{entry.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-hover">
                            <div
                              className="h-full rounded-full bg-volt transition-all duration-200"
                              style={{ width: `${entry.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status badge */}
                      {isErr && (
                        <p className="flex items-center gap-1.5 text-xs text-red-400">
                          <AlertCircle className="size-3.5 shrink-0" />
                          {entry.error}
                        </p>
                      )}
                      {done && (
                        <p className="flex items-center gap-1.5 text-xs text-volt">
                          {entry.status === 'pending'
                            ? <><Clock className="size-3.5" /> Pending approval</>
                            : <><CheckCircle2 className="size-3.5" /> Live on Videsaur</>}
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    {!isUploading && !done && (
                      <button
                        type="button"
                        aria-label="Remove file"
                        onClick={() => removeEntry(entry.id)}
                        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-mid transition-colors hover:text-hi"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Shared mood tags */}
        {entries.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-hi">
              Mood tags{' '}
              <span className="font-normal text-lo">(applied to all files)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleMood(id)}
                  aria-pressed={sharedMoods.includes(id)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    sharedMoods.includes(id)
                      ? 'border-volt bg-volt/10 text-hi'
                      : 'border-edge text-mid hover:border-volt/50 hover:text-hi',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shared license */}
        {entries.length > 0 && (
          <div>
            <label htmlFor="upload-license" className="mb-1 block text-xs font-semibold text-hi">
              License{' '}
              <span className="font-normal text-lo">(applied to all files)</span>
            </label>
            <select
              id="upload-license"
              value={sharedLicense}
              onChange={e => setSharedLicense(e.target.value)}
              className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi outline-none transition-colors focus:border-volt"
            >
              {LICENSE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        {entries.length > 0 && (
          <>
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-full bg-volt py-3 text-sm font-semibold text-hi transition-colors hover:bg-volt-hi disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Uploading…
                </span>
              ) : (
                `Upload ${idleCount} file${idleCount !== 1 ? 's' : ''}`
              )}
            </button>

            <p className="text-center text-xs text-mid">
              By uploading you confirm you own the rights or have permission to share this content
              and agree to our{' '}
              <a href="/terms" className="text-hi underline-offset-2 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/content-policy" className="text-hi underline-offset-2 hover:underline">Content Policy</a>.
            </p>
          </>
        )}
      </form>
    </>
  )
}
