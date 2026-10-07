import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Download, RotateCcw, Volume2, AlertCircle,
  ChevronDown, ChevronRight, Info, Settings2, RefreshCw, Lock,
  Upload, FileAudio, Copy, Check,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import PageHeading from '../components/PageHeading'
import { useAuth } from '../lib/authContext'

// ── Data ──────────────────────────────────────────────────────────────────────

const VOICES = [
  { id: null,                                name: 'AI Default', tone: 'Versatile',    emoji: '🤖' },
  { id: '54a5170264694bfc8e9ad98df7bd89c3', name: 'Alex',       tone: 'American',     emoji: '👨‍💼' },
  { id: '7f92f8afb8ec43bf81429cc1c9199cb1', name: 'Sophia',     tone: 'British',      emoji: '👩‍🎤' },
  { id: 'e00b6304e4eb4a989db47a2dfe51e72b', name: 'Marco',      tone: 'European',     emoji: '🎙️' },
  { id: 'fb5a5e5f8b9a4c748a32e6b9d4986e3f', name: 'Luna',       tone: 'Calm',         emoji: '🌙' },
  { id: 'c2d4b3a1e6f84d9a8b7c5e2f1a3d6b9c', name: 'Zara',       tone: 'Australian',   emoji: '⚡' },
]

const PRESETS = [
  {
    id: 'podcast',  label: 'Podcast',      icon: '🎙',
    desc: 'Clear, balanced',
    settings: { format: 'mp3', sample_rate: 44100, mp3_bitrate: 128, latency: 'normal',   speed: 1,    volume: 0 },
  },
  {
    id: 'studio',   label: 'Studio',       icon: '🎚',
    desc: 'Best quality, lossless',
    settings: { format: 'wav', sample_rate: 44100, mp3_bitrate: 192, latency: 'normal',   speed: 0.95, volume: 0 },
  },
  {
    id: 'draft',    label: 'Fast Draft',   icon: '⚡',
    desc: 'Quick preview',
    settings: { format: 'mp3', sample_rate: 24000, mp3_bitrate: 64,  latency: 'fast',     speed: 1.1,  volume: 0 },
  },
  {
    id: 'social',   label: 'Social',       icon: '📱',
    desc: 'Punchy, loud',
    settings: { format: 'mp3', sample_rate: 44100, mp3_bitrate: 192, latency: 'balanced', speed: 1.05, volume: 3 },
  },
]

const HIDDEN_DEFAULTS = {
  normalize_loudness: true, temperature: 0.7, top_p: 0.7,
  repetition_penalty: 1.2, chunk_length: 300, min_chunk_length: 50,
  max_new_tokens: 1024, early_stop_threshold: 1,
  normalize: true, condition_on_previous_chunks: true,
}

const DEFAULT_PRESET_ID = 'podcast'
const DEFAULT_SETTINGS  = { ...PRESETS[0].settings, ...HIDDEN_DEFAULTS }
const MAX_CHARS         = 5000

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tip({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative ml-1 inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}       onBlur={() => setOpen(false)}
        className="grid size-3.5 place-items-center rounded-full text-lo hover:text-mid focus:outline-none focus-visible:ring-1 focus-visible:ring-brand"
        aria-label="More info"
      >
        <Info className="size-3" />
      </button>
      {open && (
        <span role="tooltip" className="absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-xl border border-edge bg-panel px-3 py-2 text-xs leading-relaxed text-mid shadow-xl animate-rise">
          {text}
          <span className="absolute -bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-b border-r border-edge bg-panel" />
        </span>
      )}
    </span>
  )
}

// ── Slider ────────────────────────────────────────────────────────────────────
function SliderField({ label, value, onChange, min, max, step, tip }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center text-xs font-medium text-hi">
          {label}{tip && <Tip text={tip} />}
        </span>
        <span className="font-mono text-xs font-bold text-brand">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-canvas"
        style={{ background: `linear-gradient(to right,var(--brand-col) 0%,var(--brand-col) ${pct}%,var(--bg-surface-hover) ${pct}%)` }}
      />
      <div className="mt-0.5 flex justify-between text-[9px] text-lo">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, tip }) {
  return (
    <div>
      <p className="mb-1.5 flex items-center text-xs font-medium text-hi">
        {label}{tip && <Tip text={tip} />}
      </p>
      <div className="relative">
        <select
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-edge bg-canvas py-1.5 pl-3 pr-7 text-xs text-hi focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-lo" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AISoundPage() {
  const { user, loading: authLoading } = useAuth()
  const [prompt, setPrompt]               = useState('')
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0])
  const [activePreset, setActivePreset]   = useState(DEFAULT_PRESET_ID)
  const [settings, setSettings]           = useState(DEFAULT_SETTINGS)
  const [showAdvanced, setShowAdvanced]   = useState(true)
  const [audioUrl, setAudioUrl]           = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [speechFile, setSpeechFile]       = useState(null)
  const [transcript, setTranscript]       = useState('')
  const [transcribing, setTranscribing]   = useState(false)
  const [transcriptionError, setTranscriptionError] = useState(null)
  const [copied, setCopied]               = useState(false)
  const [activeTool, setActiveTool]       = useState('speech-to-text')
  const prevUrlRef                        = useRef(null)
  const speechInputRef                    = useRef(null)

  useEffect(() => {
    return () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current) }
  }, [])

  const charCount = prompt.length
  const charPct   = Math.min((charCount / MAX_CHARS) * 100, 100)
  const charWarn  = charCount > MAX_CHARS * 0.9
  const charOver  = charCount > MAX_CHARS

  const set = (key) => (val) => setSettings((s) => ({ ...s, [key]: val }))

  function applyPreset(id) {
    const p = PRESETS.find(x => x.id === id)
    if (!p) return
    setActivePreset(id)
    setSettings(s => ({ ...s, ...p.settings }))
  }

  async function handleGenerate() {
    if (!user || !prompt.trim() || charOver || loading) return
    setLoading(true)
    setError(null)
    setAudioUrl(null)
    if (prevUrlRef.current) { URL.revokeObjectURL(prevUrlRef.current); prevUrlRef.current = null }

    try {
      const body = { text: prompt.trim(), ...settings }
      if (selectedVoice.id) body.reference_id = selectedVoice.id

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Server error ${res.status}`)
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      prevUrlRef.current = url
      setAudioUrl(url)
    } catch (err) {
      console.error('[tts]', err)
      setError(err.message || 'TTS generation failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl; a.download = `ai-voice.${settings.format}`; a.click()
  }

  async function handleTranscribe() {
    if (!user || !speechFile || transcribing) return
    setTranscribing(true)
    setTranscriptionError(null)
    setTranscript('')

    try {
      const formData = new FormData()
      formData.append('audio', speechFile, speechFile.name || 'speech.wav')
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/asr`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || `Server error ${response.status}`)
      if (typeof data?.text !== 'string') throw new Error('The server returned an invalid transcription.')
      setTranscript(data.text)
    } catch (err) {
      console.error('[asr]', err)
      setTranscriptionError(err.message || 'Transcription failed')
    } finally {
      setTranscribing(false)
    }
  }

  async function handleCopyTranscript() {
    if (!transcript) return
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setTranscriptionError('Could not copy the transcript. Please copy it manually.')
    }
  }

  function handleReset() {
    setPrompt(''); setSettings(DEFAULT_SETTINGS); setActivePreset(DEFAULT_PRESET_ID)
    setSelectedVoice(VOICES[0]); setAudioUrl(null); setError(null)
    setSpeechFile(null); setTranscript(''); setTranscriptionError(null); setCopied(false)
    if (speechInputRef.current) speechInputRef.current.value = ''
  }

  const isDisabled = !user || !prompt.trim() || charOver || loading || authLoading

  return (
    <>
      <SEO
        title="AI Voice Tools — Speech to Text & Text to Speech"
        description="Transcribe speech into editable text or generate AI voice-over audio with AI voice tools."
        canonicalPath="/ai-sound"
      />

      <div className="flex flex-col gap-3">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PageHeading level={1} text="AI Voice Tools" keyword="AI Voice" />
            <span className="inline-flex items-center rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              New
            </span>
          </div>
          <button
            type="button" onClick={handleReset}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-edge bg-panel px-3 py-1.5 text-xs font-medium text-mid hover:bg-panel-hover hover:text-hi"
          >
            <RotateCcw className="size-3" />Reset
          </button>
        </div>

        {/* ── Tool tabs ──────────────────────────────────── */}
        <div
          role="tablist"
          aria-label="AI voice tools"
          className="inline-grid w-fit max-w-full grid-cols-2 gap-0.5 rounded-xl border border-edge bg-panel p-1"
        >
          {[
            { id: 'speech-to-text', label: 'Speech to Text', icon: FileAudio },
            { id: 'text-to-speech', label: 'Text to Speech', icon: Volume2 },
          ].map((tool) => {
            const Icon = tool.icon
            const selected = activeTool === tool.id
            return (
              <button
                key={tool.id}
                id={`${tool.id}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${tool.id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTool(tool.id)}
                className={[
                  'flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3',
                  selected
                    ? 'border-brand bg-brand/15 text-brand shadow-sm shadow-brand/20'
                    : 'border-transparent text-mid hover:border-edge hover:bg-panel-hover hover:text-hi',
                ].join(' ')}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── 2-column grid ──────────────────────────────── */}
        {activeTool === 'text-to-speech' && (
        <div
          id="text-to-speech-panel"
          role="tabpanel"
          aria-labelledby="text-to-speech-tab"
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
        >

          {/* ═══ LEFT: Text input ══════════════════════════ */}
          <section className="flex flex-col gap-2.5 rounded-2xl border border-edge bg-panel p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-fill text-[10px] font-bold text-ink">1</span>
              <label htmlFor="tts-prompt" className="text-xs font-semibold text-hi">Write your text</label>
            </div>

            <textarea
              id="tts-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Welcome to Videsaur — where memes come alive!"
              rows={8}
              maxLength={MAX_CHARS + 200}
              className={[
                'w-full flex-1 resize-none rounded-xl border px-3.5 py-3 text-sm text-hi placeholder:text-lo',
                'focus:outline-none focus:ring-2 transition-colors',
                charOver
                  ? 'border-red-500/60 bg-red-500/5 focus:ring-red-500/30'
                  : 'border-edge bg-canvas focus:border-brand focus:ring-brand/25',
              ].join(' ')}
            />

            {/* Char counter */}
            <div className="flex items-center gap-2.5">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-panel-hover">
                <div
                  className={[
                    'h-full rounded-full transition-[width,background-color] duration-300',
                    charOver ? 'bg-red-500' : charWarn ? 'bg-amber-400' : 'bg-brand',
                  ].join(' ')}
                  style={{ width: `${charPct}%` }}
                />
              </div>
              <span className={[
                'shrink-0 text-xs tabular-nums font-medium',
                charOver ? 'text-red-400' : charWarn ? 'text-amber-400' : 'text-mid',
              ].join(' ')}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>

            {charOver && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="size-3.5 shrink-0" />
                Text exceeds the 5,000-character limit.
              </p>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-red-400">Generation failed</p>
                  <p className="mt-0.5 text-red-400/80">{error}</p>
                </div>
              </div>
            )}
          </section>

          {/* ═══ RIGHT: Voice + Settings ═══════════════════ */}
          <section className="flex flex-col gap-2.5 rounded-2xl border border-edge bg-panel p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-[10px] font-bold text-brand">2</span>
              <span className="text-xs font-semibold text-hi">Choose a voice &amp; quality</span>
            </div>

            {/* Voice persona grid — 3×2, compact */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-lo">Voice Persona</p>
              <div className="grid grid-cols-3 gap-1.5">
                {VOICES.map(v => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVoice(v)}
                    className={[
                      'flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all',
                      selectedVoice.name === v.name
                        ? 'border-brand bg-brand/10 shadow-sm shadow-brand/20'
                        : 'border-edge bg-canvas hover:border-brand/40 hover:bg-panel-hover',
                    ].join(' ')}
                  >
                    <span className="text-base leading-none" aria-hidden>{v.emoji}</span>
                    <div className="min-w-0">
                      <p className={`truncate text-[11px] font-semibold leading-tight ${selectedVoice.name === v.name ? 'text-brand' : 'text-hi'}`}>
                        {v.name}
                      </p>
                      <p className="truncate text-[9px] leading-tight text-lo">{v.tone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality presets — 4 compact pills */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-lo">Quality Preset</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={[
                      'flex flex-col items-start rounded-xl border px-2.5 py-2 transition-all',
                      activePreset === p.id
                        ? 'border-brand bg-brand/10 shadow-sm shadow-brand/20'
                        : 'border-edge bg-canvas hover:border-brand/40 hover:bg-panel-hover',
                    ].join(' ')}
                  >
                    <span className="text-sm leading-none" aria-hidden>{p.icon}</span>
                    <p className={`mt-1.5 text-[11px] font-semibold leading-tight ${activePreset === p.id ? 'text-brand' : 'text-hi'}`}>
                      {p.label}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-tight text-lo">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced accordion */}
            <div className="rounded-xl border border-edge bg-canvas overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                aria-expanded={showAdvanced}
                className="flex w-full items-center justify-between px-3 py-2 hover:bg-panel-hover transition-colors"
              >
                <span className="flex items-center gap-1.5 text-xs font-medium text-mid">
                  <Settings2 className="size-3.5 text-lo" />
                  Advanced settings
                  <span className="rounded bg-panel-hover px-1.5 py-0.5 text-[9px] text-lo">
                    Speed {settings.speed}× · Vol {settings.volume}dB · {settings.latency}
                  </span>
                </span>
                <ChevronRight className={`size-3.5 shrink-0 text-lo transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="border-t border-edge px-3 pb-3 pt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  <SliderField
                    label="Speed" value={settings.speed} onChange={set('speed')}
                    min={0.5} max={2} step={0.05}
                    tip="How fast the voice speaks. 1.0 = normal; 0.5 = half; 2.0 = double."
                  />
                  <SliderField
                    label="Volume (dB)" value={settings.volume} onChange={set('volume')}
                    min={-10} max={10} step={1}
                    tip="Loudness offset in decibels. 0 = original. +3 dB is noticeably louder."
                  />
                  <SelectField
                    label="Audio Format" value={settings.format} onChange={set('format')}
                    options={[
                      { value: 'mp3', label: 'MP3 — compressed' },
                      { value: 'wav', label: 'WAV — lossless'  },
                      { value: 'pcm', label: 'PCM — raw data'  },
                    ]}
                  />
                  <SelectField
                    label="Sample Rate" value={settings.sample_rate}
                    onChange={(v) => set('sample_rate')(Number(v))}
                    tip="Higher Hz = better fidelity. 44 100 Hz is CD quality."
                    options={[8000, 16000, 24000, 32000, 44100].map(r => ({ value: r, label: `${r.toLocaleString()} Hz` }))}
                  />
                  {settings.format === 'mp3' && (
                    <SelectField
                      label="MP3 Bitrate" value={settings.mp3_bitrate}
                      onChange={(v) => set('mp3_bitrate')(Number(v))}
                      tip="Higher kbps = better quality, larger file. 128 kbps is standard."
                      options={[64, 128, 192].map(b => ({ value: b, label: `${b} kbps` }))}
                    />
                  )}
                  <div>
                    <p className="mb-1.5 flex items-center text-xs font-medium text-hi">
                      Latency<Tip text="Normal = best quality. Fast = lowest wait time but may sound less natural." />
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {['normal', 'balanced', 'fast'].map(opt => (
                        <button
                          key={opt} type="button" onClick={() => set('latency')(opt)}
                          className={[
                            'rounded-lg py-1.5 text-[10px] font-medium capitalize transition-all',
                            settings.latency === opt
                              ? 'btn-primary shadow-sm shadow-brand/30'
                              : 'border border-edge bg-panel text-mid hover:bg-panel-hover hover:text-hi',
                          ].join(' ')}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        )}

        {/* ── Speech to text ─────────────────────────────── */}
        {activeTool === 'speech-to-text' && (
        <section
          id="speech-to-text-panel"
          role="tabpanel"
          aria-labelledby="speech-to-text-tab"
          className="rounded-2xl border border-edge bg-panel p-4"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-brand/15"><FileAudio className="size-4 text-brand" /></span>
                <div>
                  <h2 className="text-sm font-semibold text-hi">AI Speech to Text</h2>
                  <p className="text-[11px] text-lo">Upload audio and turn spoken words into editable text.</p>
                </div>
              </div>

              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-edge bg-canvas px-4 py-3 transition-colors hover:border-brand/50 hover:bg-panel-hover">
                <Upload className="size-5 shrink-0 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-hi">{speechFile ? speechFile.name : 'Choose an audio file'}</span>
                  <span className="block text-[10px] text-lo">
                    {speechFile ? `${(speechFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP3, WAV, M4A, OGG, FLAC, or WebM · up to 25 MB'}
                  </span>
                </span>
                <input
                  ref={speechInputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/ogg,audio/flac,audio/webm,.mp3,.wav,.m4a,.ogg,.flac,.webm"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setSpeechFile(file)
                    setTranscript('')
                    setTranscriptionError(file?.size > 25 * 1024 * 1024 ? 'Audio file must be 25 MB or smaller.' : null)
                  }}
                />
              </label>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTranscribe}
                  disabled={!user || !speechFile || speechFile.size > 25 * 1024 * 1024 || transcribing || authLoading}
                  className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {transcribing
                    ? <><span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Transcribing…</>
                    : <><Sparkles className="size-3.5" />Transcribe Audio</>}
                </button>
                {!authLoading && !user && <Link to="/login" className="text-xs font-medium text-brand hover:underline">Sign in to use this tool</Link>}
              </div>

              {transcriptionError && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="size-3.5 shrink-0" />{transcriptionError}</p>
              )}
            </div>

            <div className="min-w-0 flex-1 rounded-xl border border-edge bg-canvas p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-hi">Transcript</span>
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  disabled={!transcript}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-mid hover:bg-panel-hover disabled:opacity-40"
                >
                  {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder={transcribing ? 'Listening to your audio…' : 'Your transcription will appear here.'}
                rows={6}
                className="w-full resize-y rounded-lg border border-edge bg-panel px-3 py-2 text-sm leading-relaxed text-hi placeholder:text-lo focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/30"
              />
            </div>
          </div>
        </section>
        )}
      </div>

      {/* ── Sticky footer bar ──────────────────────────────── */}
      {activeTool === 'text-to-speech' && (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-canvas/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-2.5">

          {!authLoading && !user ? (
            /* Auth gate */
            <>
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/15">
                  <Lock className="size-3.5 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-hi">Sign in to generate audio</p>
                  <p className="hidden text-[10px] text-lo sm:block">Create a free account to use AI Voice Generator.</p>
                </div>
              </div>
              <Link
                to="/login"
                className="btn-primary shrink-0 rounded-xl px-5 py-2 text-sm font-semibold shadow-md shadow-brand/25"
              >
                Sign in / Sign up
              </Link>
            </>
          ) : audioUrl ? (
            /* Audio player state */
            <>
              <div className="flex items-center gap-2 shrink-0">
                <div className="grid size-7 place-items-center rounded-full bg-brand-fill shadow-sm shadow-brand/30">
                  <Volume2 className="size-3.5 text-ink" />
                </div>
                <span className="text-xs font-semibold text-hi">Ready</span>
                <span className="text-[10px] text-lo">{VOICES.find(v => v.name === selectedVoice.name)?.emoji} {selectedVoice.name} · {settings.format.toUpperCase()}</span>
              </div>
              <audio src={audioUrl} controls className="h-8 flex-1 min-w-0" />
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button" onClick={handleDownload} title="Download"
                  className="grid size-8 place-items-center rounded-xl border border-edge bg-panel hover:bg-panel-hover"
                >
                  <Download className="size-3.5 text-mid" />
                </button>
                <button
                  type="button" onClick={handleGenerate} disabled={isDisabled} title="Regenerate"
                  className="grid size-8 place-items-center rounded-xl border border-edge bg-panel hover:bg-panel-hover disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5 text-mid" />
                </button>
                <button
                  type="button" onClick={handleGenerate} disabled={isDisabled}
                  className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-md shadow-brand/30 disabled:cursor-not-allowed"
                >
                  <Sparkles className="size-3.5" />New
                </button>
              </div>
            </>
          ) : (
            /* Default / generating state */
            <>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
                    <span className="text-xs text-mid">Generating your audio… (5–15 s)</span>
                  </div>
                ) : prompt.trim() ? (
                  <p className="truncate text-xs text-lo">
                    "{prompt.slice(0, 72)}{prompt.length > 72 ? '…' : ''}"
                  </p>
                ) : (
                  <p className="text-xs text-lo">Enter text in Step 1, then hit Generate</p>
                )}
              </div>
              <button
                type="button" onClick={handleGenerate} disabled={isDisabled}
                className="btn-primary flex shrink-0 items-center gap-2 rounded-xl px-6 py-2 text-sm font-semibold shadow-lg shadow-brand/30 hover:shadow-brand/50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating…
                  </>
                ) : (
                  <><Sparkles className="size-4" />Generate Audio</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      )}
    </>
  )
}
