// Small, pure security helpers for the form endpoints (server only).

import { createHmac, timingSafeEqual } from 'node:crypto'

/** Escape a value for use inside notification-email HTML. */
export function escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Collapse line breaks, so user input cannot inject headers through a subject. */
export function singleLine(v) {
  return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim()
}

const sign = (body, secret) => createHmac('sha256', secret).update(body).digest('base64url')

/**
 * A short-lived, tamper-proof token (used for gated download links).
 * @param {unknown} payload
 * @param {string} secret
 * @param {number} ttlMs
 * @param {number} [now]
 * @returns {string}
 */
export function signToken(payload, secret, ttlMs, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ p: payload, exp: now + ttlMs })).toString('base64url')
  return `${body}.${sign(body, secret)}`
}

/**
 * The payload of a valid, unexpired token; otherwise null.
 * @param {unknown} token
 * @param {string} secret
 * @param {number} [now]
 */
export function verifyToken(token, secret, now = Date.now()) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  const expected = Buffer.from(sign(parts[0], secret))
  const given = Buffer.from(parts[1])
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  try {
    const { p, exp } = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
    return typeof exp === 'number' && now <= exp ? p : null
  } catch {
    return null
  }
}

// Rate limit: the same numbers the Cloud Functions used.
export const RATE_WINDOW_MS = 15 * 60 * 1000
export const RATE_MAX_PER_IP = 12
export const RATE_MAX_GLOBAL = 300 // bounds total volume even if the per-address key is forged

/**
 * The counter after one more request: counts up inside the window, restarts after it.
 * @param {{ count?: number, first?: number } | null | undefined} state
 * @param {number} now
 * @param {number} [windowMs]
 * @returns {{ count: number, first: number }}
 */
export function nextWindow(state, now, windowMs = RATE_WINDOW_MS) {
  const count = state?.count || 0
  const first = state?.first || now
  return now - first > windowMs ? { count: 1, first: now } : { count: count + 1, first }
}

/** True when either counter (already including this request) is past its limit. */
export function isOverLimit(ip, global) {
  return ip.count > RATE_MAX_PER_IP || global.count > RATE_MAX_GLOBAL
}

/**
 * The caller's address for rate limiting. A reverse proxy appends the real client
 * address as the LAST X-Forwarded-For entry; anything before it is client-supplied.
 * @param {Headers} headers
 * @returns {string}
 */
export function clientIp(headers) {
  const parts = String(headers.get('x-forwarded-for') || '').split(',').map((s) => s.trim()).filter(Boolean)
  const ip = parts.length ? parts[parts.length - 1] : 'unknown'
  return ip.replace(/[^a-zA-Z0-9_.:-]/g, '_').slice(0, 80) || 'unknown'
}
