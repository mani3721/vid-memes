import { useRef, useState } from 'react'
import { UploadCloud, X, CheckCircle2, AlertCircle, FileVideo, FileImage, Music, Clock, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from './SEO'
import { useAuth } from '../lib/authContext'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

const ACCEPTED = '.mp4,.webm,.gif,.png,.jpg,.jpeg,.webp,.mp3,.wav'
const MOOD_OPTIONS = [
  { id: 'laugh',     label: '😂 Funny'      },
  { id: 'savage',    label: '🔥 Savage'      },
  { id: 'cursed',    label: '💀 Cursed'      },
  { id: 'wholesome', label: '😢 Wholesome'   },
  { id: 'nostalgic', label: '🐸 Nostalgic'   },
]
const CATEGORY_OPTIONS = ['videos', 'gifs', 'images', 'sounds']
const LICENSE_OPTIONS = [
  { value: 'CC0',       label: 'CC0 — Public Domain (commercial use OK)' },
  { value: 'Editorial', label: 'Editorial — Non-commercial / Transformative use' },
]

function fileIcon(mime) {
  if (!mime) return UploadCloud
  if (mime.startsWith('video/') || mime === 'image/gif') return FileVideo
  if (mime.startsWith('image/')) return FileImage
  if (mime.startsWith('audio/')) return Music
  return UploadCloud
}

export default function UploadForm() {
  const { user, session, loading: authLoading } = useAuth()
  const [file, setFile] = useState(null)
  const [fields, setFields] = useState({
    title: '',
    category: '',
    license: 'CC0',
    moods: [],
  })
  const [progress, setProgress] = useState(0)   // 0–100
  const [status, setStatus] = useState('idle')   // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(false)
  const fileRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped) acceptFile(dropped)
  }

  function acceptFile(f) {
    setFile(f)
    setStatus('idle')
    setErrorMsg('')
    // Auto-detect category from MIME
    const m = f.type
    const cat = m.startsWith('video/') || m === 'image/gif'
      ? m === 'image/gif' ? 'gifs' : 'videos'
      : m.startsWith('image/') ? 'images'
      : m.startsWith('audio/') ? 'sounds'
      : ''
    setFields((prev) => ({ ...prev, category: cat }))
  }

  function toggleMood(id) {
    setFields((prev) => ({
      ...prev,
      moods: prev.moods.includes(id)
        ? prev.moods.filter((m) => m !== id)
        : [...prev.moods, id],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !fields.title.trim()) return
    setStatus('uploading')
    setProgress(0)
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', fields.title.trim())
    formData.append('category', fields.category)
    formData.append('license', fields.license)
    if (fields.moods.length) formData.append('mood_tags', fields.moods.join(','))

    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 95))
    })
    xhr.addEventListener('load', () => {
      setProgress(100)
      if (xhr.status === 201) {
        const body = JSON.parse(xhr.responseText)
        setStatus('success')
        setResult(body.meme)
        setPendingApproval(body.pendingApproval ?? false)
      } else {
        const msg = JSON.parse(xhr.responseText)?.error ?? 'Upload failed'
        setStatus('error')
        setErrorMsg(msg)
      }
    })
    xhr.addEventListener('error', () => {
      setStatus('error')
      setErrorMsg('Network error — check your connection and try again.')
    })

    xhr.open('POST', `${API_BASE}/api/upload`)
    if (session?.access_token) {
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
    }
    xhr.send(formData)
  }

  const Icon = fileIcon(file?.type)

  // Show auth gate if not signed in
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

  if (status === 'success' && result) {
    return (
      <div className="flex flex-col items-center gap-5 py-14 text-center">
        {pendingApproval ? (
          <Clock className="size-14 text-blaze" />
        ) : (
          <CheckCircle2 className="size-14 text-volt" />
        )}
        <div>
          <p className="text-xl font-semibold text-hi">
            {pendingApproval ? 'Upload received!' : 'Upload complete!'}
          </p>
          <p className="mt-1 text-sm text-mid">
            {pendingApproval
              ? `${result.title} is pending admin approval before going live.`
              : `${result.title} is now live on Videsaur.`}
          </p>
        </div>
        <img
          src={result.thumbnail_url}
          alt={result.title}
          className="size-32 rounded-2xl object-cover"
        />
        <button
          type="button"
          onClick={() => { setFile(null); setResult(null); setStatus('idle'); setProgress(0); setPendingApproval(false) }}
          className="rounded-full bg-volt px-6 py-2.5 text-sm font-semibold text-hi transition-colors hover:bg-volt-hi"
        >
          Upload another
        </button>
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
          <h1 className="font-display text-2xl tracking-wide text-hi sm:text-3xl">
            UPLOAD A MEME
          </h1>
          <p className="mt-1 text-sm text-mid">
            MP4, WebM, GIF up to 50 MB · PNG, JPG up to 10 MB · MP3, WAV up to 20 MB
          </p>
        </div>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="File drop zone — click or drag a file here"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          className={[
            'relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors',
            file ? 'border-volt/60 bg-volt/5' : 'border-edge hover:border-volt/50',
          ].join(' ')}
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && acceptFile(e.target.files[0])}
          />

          {file ? (
            <>
              <Icon className="size-10 text-volt" />
              <div className="text-center">
                <p className="text-sm font-semibold text-hi">{file.name}</p>
                <p className="text-xs text-mid">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={(e) => { e.stopPropagation(); setFile(null); setFields((f) => ({ ...f, category: '' })) }}
                className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-panel text-mid transition-colors hover:text-hi"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <UploadCloud className="size-10 text-mid" />
              <p className="text-sm text-mid">
                <span className="font-semibold text-hi">Click to browse</span> or drag & drop
              </p>
            </>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="upload-title" className="mb-1 block text-xs font-semibold text-hi">
            Title <span className="text-volt">*</span>
          </label>
          <input
            id="upload-title"
            type="text"
            required
            maxLength={200}
            value={fields.title}
            onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi placeholder-mist/50 outline-none transition-colors focus:border-volt"
            placeholder="e.g. Confused math lady overlay"
          />
        </div>

        {/* Category */}
        <div>
          <p className="mb-1 text-xs font-semibold text-hi">
            Category <span className="text-volt">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFields((f) => ({ ...f, category: cat }))}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                  fields.category === cat
                    ? 'border-volt bg-volt/10 text-hi'
                    : 'border-edge text-mid hover:border-volt/50 hover:text-hi',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mood tags */}
        <div>
          <p className="mb-1 text-xs font-semibold text-hi">Mood tags</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleMood(id)}
                aria-pressed={fields.moods.includes(id)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  fields.moods.includes(id)
                    ? 'border-volt bg-volt/10 text-hi'
                    : 'border-edge text-mid hover:border-volt/50 hover:text-hi',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* License */}
        <div>
          <label htmlFor="upload-license" className="mb-1 block text-xs font-semibold text-hi">
            License
          </label>
          <select
            id="upload-license"
            value={fields.license}
            onChange={(e) => setFields((f) => ({ ...f, license: e.target.value }))}
            className="w-full rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-hi outline-none transition-colors focus:border-volt"
          >
            {LICENSE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Progress bar */}
        {status === 'uploading' && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-mid">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-hover">
              <div
                className="h-full rounded-full bg-volt transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || !fields.title.trim() || !fields.category || status === 'uploading'}
          className="w-full rounded-full bg-volt py-3 text-sm font-semibold text-hi transition-colors hover:bg-volt-hi disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'uploading' ? 'Uploading…' : 'Upload meme'}
        </button>

        <p className="text-center text-xs text-mid">
          By uploading you confirm you own the rights or have permission to share this content and
          agree to our{' '}
          <a href="/terms" className="text-hi underline-offset-2 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/content-policy" className="text-hi underline-offset-2 hover:underline">Content Policy</a>.
        </p>
      </form>
    </>
  )
}
