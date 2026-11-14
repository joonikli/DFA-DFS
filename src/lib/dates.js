const DAY = 24 * 60 * 60 * 1000

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY)
}

function formatHour(d, withSuffix) {
  const h = d.getHours()
  const m = d.getMinutes()
  const h12 = h % 12 || 12
  const base = m ? `${h12}:${String(m).padStart(2, '0')}` : `${h12}`
  return withSuffix ? `${base} ${h < 12 ? 'am' : 'pm'}` : base
}

/** "2-5 pm", "11:30 am-4 pm" — matches the Figma event cards. */
export function formatTimeRange(start, end) {
  const samePeriod = start.getHours() < 12 === end.getHours() < 12
  return `${formatHour(start, !samePeriod)}-${formatHour(end, true)}`
}

export function hoursBetween(start, end) {
  return (end - start) / (60 * 60 * 1000)
}

export function formatShortDate(d) {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`
}
