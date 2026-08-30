// UI constants — not mock data. All actual media comes from Supabase.

export const MOODS = [
  { id: 'laugh',     emoji: '😂', label: 'Make me laugh' },
  { id: 'wholesome', emoji: '😢', label: 'Wholesome' },
  { id: 'cursed',    emoji: '💀', label: 'Cursed' },
  { id: 'nostalgic', emoji: '🐸', label: 'Nostalgic' },
  { id: 'savage',    emoji: '🔥', label: 'Savage' },
]

export const FORMATS  = ['MP4', 'GIF', 'WebM', 'PNG', 'MP3', 'WAV']
export const ASPECTS  = ['9:16', '1:1', '16:9']
export const LICENSES = ['CC0', 'Editorial']

export const SUB_NAV = [
  'Trending',
  'Green Screen',
  'Reaction Clips',
  'Alpha PNGs',
  'Sound FX',
  'Templates',
  'Nostalgia Vault',
]

/** Formats an integer like 8421 as "8.4K". */
export function compact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n ?? 0)
}

/** Returns a short relative time string, e.g. "2h ago", "3d ago". */
export function timeAgo(iso) {
  if (!iso) return null
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk}w ago`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function formatDuration(sec) {
  if (!sec) return '—'
  return `0:${String(sec).padStart(2, '0')}`
}
