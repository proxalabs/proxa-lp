// The numbers inside a figure such as "80–95%", "5,000+" or "3.8×", for the count-up effect
// (components/CountUp.jsx). Pure, so it is tested without a browser.

const NUMBER = /(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?/g
const RANK = /^(?:st|nd|rd|th)\b/i

/**
 * Split a figure into the text that stays as written and the numbers that count up.
 * Null when nothing in it should count: no number, a zero, or only a rank such as "1st".
 * @param {unknown} text
 * @returns {(string | { raw: string, value: number, decimals: number, grouped: boolean })[] | null}
 */
export function parseFigure(text) {
  if (typeof text !== 'string') return null
  const parts = []
  let last = 0
  let counts = false
  for (const match of text.matchAll(NUMBER)) {
    const raw = match[0]
    const end = match.index + raw.length
    const value = Number(raw.replace(/,/g, ''))
    // A rank is a name, not an amount, and zero has nowhere to count to: both stay as text.
    if (value === 0 || RANK.test(text.slice(end))) continue
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push({ raw, value, decimals: (raw.split('.')[1] || '').length, grouped: raw.includes(',') })
    last = end
    counts = true
  }
  if (!counts) return null
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

/**
 * The figure as it reads a fraction `t` of the way through its count: 0 is all zeros, 1 is
 * exactly the figure as written. Decimals and thousands separators are kept throughout.
 * @param {NonNullable<ReturnType<typeof parseFigure>>} parts
 * @param {number} t
 * @returns {string}
 */
export function figureAt(parts, t) {
  const progress = Math.min(1, Math.max(0, t))
  return parts
    .map((part) => {
      if (typeof part === 'string') return part
      if (progress === 1) return part.raw
      return (part.value * progress).toLocaleString('en-US', {
        minimumFractionDigits: part.decimals,
        maximumFractionDigits: part.decimals,
        useGrouping: part.grouped,
      })
    })
    .join('')
}
