import assert from 'node:assert/strict'
import { test } from 'node:test'

import { slugify, validateSlug } from './slugRules.js'

test('slugify makes a clean web address from a title', () => {
  assert.equal(slugify('The Readiness Gap: What’s Next?'), 'the-readiness-gap-whats-next')
  assert.equal(slugify('  AI   Readiness -- Day  '), 'ai-readiness-day')
  assert.equal(slugify(''), '')
})

test('validateSlug accepts lowercase letters, numbers and hyphens', () => {
  assert.equal(validateSlug('ai-readiness-day'), true)
  assert.equal(validateSlug('2026-outlook'), true)
})

test('validateSlug rejects anything that is not a clean address', () => {
  for (const bad of ['Bad Slug', 'UPPER', 'trailing/', '-leading', 'under_score', 'a.b', '']) {
    assert.equal(typeof validateSlug(bad), 'string', `"${bad}" should be rejected`)
  }
})

test('a built page cannot take a reserved address', () => {
  for (const reserved of ['blog', 'admin', 'platform', 'api', 'the-lab', 'letsmeet']) {
    assert.equal(typeof validateSlug(reserved, { reserved: true }), 'string', `"${reserved}" should be rejected`)
  }
  assert.equal(validateSlug('ai-readiness-day', { reserved: true }), true)
})

test('reserved addresses are only enforced where asked', () => {
  // A blog post lives at /blog/<slug>, so "platform" is a fine post slug.
  assert.equal(validateSlug('platform'), true)
})
