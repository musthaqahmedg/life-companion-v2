// Mood scale, like a sky over a day: dusk indigo (1) → morning blue (4) → sage (7) → sunrise gold (10).
const STOPS = [
  [1, [75, 78, 140]],
  [4, [104, 140, 186]],
  [7, [127, 184, 152]],
  [10, [242, 181, 68]],
]

export function moodColor(score) {
  const s = Math.min(10, Math.max(1, score))
  // the segment [STOPS[i], STOPS[i + 1]] that contains s
  let i = 0
  while (i < STOPS.length - 2 && s > STOPS[i + 1][0]) i++
  const [a, ca] = STOPS[i]
  const [b, cb] = STOPS[i + 1]
  const t = (s - a) / (b - a)
  const rgb = ca.map((v, k) => Math.round(v + (cb[k] - v) * t))
  return `rgb(${rgb.join(' ')})`
}

// Readable number colour on top of a mood tile.
export const moodInk = (score) => (score >= 5 ? '#1D2B2A' : '#FFFFFF')

export const MOOD_WORDS = {
  1: 'Awful', 2: 'Very low', 3: 'Low', 4: 'Meh', 5: 'Okay',
  6: 'Fine', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Best day',
}

// Local calendar date as YYYY-MM-DD (not UTC, so late-evening check-ins land on the right day).
export function localISODate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function lastNDays(n) {
  const days = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(localISODate(d))
  }
  return days
}

export function prettyDate(iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts)
}
