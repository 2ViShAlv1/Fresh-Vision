export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
export const MAX_BYTES = 10 * 1024 * 1024

export function validateFile(file) {
  if (!file) return 'No file selected.'
  if (!file.type.startsWith('image/')) return 'That file is not an image.'
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG, WEBP or BMP image.'
  if (file.size > MAX_BYTES) return 'Image is larger than 10 MB.'
  return null
}

export function formatBytes(bytes) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Maps a freshness verdict to its accent colour + supporting copy. */
export function verdictTheme(result) {
  if (!result) return { color: 'var(--muted)', tone: 'neutral', label: '' }
  if (result.status === 'rejected') {
    return { color: 'var(--amber)', tone: 'warn', label: 'Rejected by gatekeeper' }
  }
  if (result.status === 'uncertain') {
    return { color: 'var(--amber)', tone: 'warn', label: 'Low confidence' }
  }
  const key = result.freshnessKey || ''
  if (key === 'very_fresh') return { color: '#37d67a', tone: 'good', label: 'Peak quality — safe to sell' }
  if (key === 'fresh') return { color: '#5fd88f', tone: 'good', label: 'Good quality — safe to sell' }
  if (key === 'slightly_rotten') return { color: '#ffb020', tone: 'warn', label: 'Declining — prioritise for sale' }
  if (key === 'rotten') return { color: '#ff7a45', tone: 'bad', label: 'Spoiled — remove from shelf' }
  return { color: '#ff5c5c', tone: 'bad', label: 'Heavily spoiled — discard' }
}

export function scoreOutOfTen(result) {
  const map = { very_fresh: 9.5, fresh: 8.0, slightly_rotten: 5.0, rotten: 2.5, very_rotten: 1.0 }
  return map[result?.freshnessKey] ?? null
}
