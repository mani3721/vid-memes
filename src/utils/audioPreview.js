/**
 * Shared audio-preview helpers.
 *
 * Extracted from SoundCard so the sound detail page can reuse both the
 * waveform generator and the single-player rule. Keeping the "only one clip
 * plays at a time" registry in one module matters now that two different
 * components render players on the same page — the detail page's hero and the
 * SoundCard rows in "You Might Also Like". A module-local registry in each
 * would let one of each play simultaneously.
 */

/**
 * Deterministic pseudo-random bar heights, so a given track always draws the
 * same waveform on every render and every device.
 *
 * This is decorative, not analytical: decoding the actual audio to measure
 * amplitude would mean downloading and running it through an AudioContext
 * before anything could paint. An LCG seeded from the track id gives a stable,
 * distinctive shape for free.
 *
 * @param {string} id     — track id, used as the seed
 * @param {number} count  — number of bars
 * @returns {number[]} heights as percentages (18–82)
 */
export function waveformBars(id = '', count = 36) {
  let seed = 0
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0
  return Array.from({ length: count }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return 18 + (seed % 64) // 18–82 % height
  })
}

let activeAudio = null

/**
 * Take over playback, stopping whatever was playing before.
 * Call immediately before .play().
 */
export function claimPlayback(audio) {
  if (activeAudio && activeAudio !== audio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
  }
  activeAudio = audio
}

/** Release the claim when a clip ends or unmounts. */
export function releasePlayback(audio) {
  if (activeAudio === audio) activeAudio = null
}

/** Seconds → "1:07". Returns "0:00" for unknown/invalid durations. */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
