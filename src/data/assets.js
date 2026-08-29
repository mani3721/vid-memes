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

export function formatDuration(sec) {
  if (!sec) return '—'
  return `0:${String(sec).padStart(2, '0')}`
}
