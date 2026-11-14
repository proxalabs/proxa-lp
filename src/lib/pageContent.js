// The fixed marketing pages keep their copy in code (src/content) and let the CMS
// override any field. These helpers are pure so the same getter works in server
// and client components.

/**
 * Payload field name for a manifest key: "hero.ctaLabel" → "hero_ctaLabel".
 * @param {string} key
 * @returns {string}
 */
export function fieldName(key) {
  return key.replace(/\./g, '_')
}

/**
 * Build c(key): the CMS override when it has real content, otherwise the default.
 * @param {Record<string, string>} defaults
 * @param {Record<string, string | null | undefined>} [overrides]
 * @returns {(key: string) => string | undefined}
 */
export function makeGetter(defaults, overrides) {
  const ov = overrides || {}
  return (key) => {
    const value = ov[key]
    return value != null && String(value).trim() !== '' ? value : defaults[key]
  }
}
