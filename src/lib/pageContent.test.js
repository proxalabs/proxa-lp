import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MANIFEST } from '../content/manifest.js'
import { fieldName, makeGetter, resolveContent } from './pageContent.js'

test('fieldName turns a dotted manifest key into a field name', () => {
  assert.equal(fieldName('hero.ctaLabel'), 'hero_ctaLabel')
  assert.equal(fieldName('engagements.0.title'), 'engagements_0_title')
})

test('an override wins over the default', () => {
  const c = makeGetter({ a: 'A' }, { a: 'X' })
  assert.equal(c('a'), 'X')
})

test('a blank or whitespace-only override falls back to the default', () => {
  const c = makeGetter({ a: 'A', b: 'B', d: 'D' }, { a: '', b: '   ', d: null })
  assert.equal(c('a'), 'A')
  assert.equal(c('b'), 'B')
  assert.equal(c('d'), 'D')
})

test('no overrides at all gives the defaults', () => {
  assert.equal(makeGetter({ a: 'A' })('a'), 'A')
  assert.equal(makeGetter({ a: 'A' }, undefined)('zzz'), undefined)
})

// Postgres truncates identifiers at 63 bytes and Payload snake-cases field names
// into column names, so two keys must never collapse into one column.
const columnName = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()

test('every manifest key maps to a unique column-safe field name', () => {
  let total = 0
  for (const [pageId, page] of Object.entries(MANIFEST)) {
    const seen = new Map()
    for (const field of page.fields) {
      total += 1
      const name = fieldName(field.key)
      assert.match(name, /^[a-zA-Z][a-zA-Z0-9_]*$/, `${pageId}: ${field.key}`)
      const column = columnName(name)
      assert.ok(column.length <= 50, `${pageId}: ${field.key} → ${column} is too long`)
      assert.ok(!seen.has(column), `${pageId}: ${field.key} collides with ${seen.get(column)}`)
      seen.set(column, field.key)
    }
  }
  assert.ok(total > 300, `expected the full manifest, saw ${total} fields`)
})

test('resolveContent merges overrides onto defaults, skipping blank ones', () => {
  const merged = resolveContent({ a: 'A', b: 'B', c: 'C' }, { a: 'X', b: '  ', extra: 'ignored' })
  assert.deepEqual(merged, { a: 'X', b: 'B', c: 'C' })
})

test('a getter over resolved content needs no overrides', () => {
  const c = makeGetter(resolveContent({ a: 'A' }, { a: 'X' }))
  assert.equal(c('a'), 'X')
})
