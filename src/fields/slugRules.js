import { RESERVED_SLUGS } from '../lib/routes.js'

/**
 * A clean web address from free text: "The Readiness Gap!" → "the-readiness-gap".
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Payload-style validator: true, or the message to show the editor.
 * `reserved: true` also rejects addresses the site already uses (for built pages,
 * which live at the top level: /<slug>).
 * @param {unknown} value
 * @param {{ reserved?: boolean }} [opts]
 * @returns {true | string}
 */
export function validateSlug(value, opts = {}) {
  const slug = typeof value === 'string' ? value : ''
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return 'Use lowercase letters, numbers and hyphens only (for example: ai-readiness-day).'
  }
  if (opts.reserved && RESERVED_SLUGS.has(slug)) {
    return `“/${slug}” is already used by the site — pick a different address.`
  }
  return true
}
