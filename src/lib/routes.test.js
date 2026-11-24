import assert from 'node:assert/strict'
import { test } from 'node:test'

import { hrefFor, pageKeyForPath, PAGE_PATHS, RESERVED_SLUGS } from './routes.js'

test('hrefFor maps keys, hashes and slugs', () => {
  assert.equal(hrefFor('home'), '/')
  assert.equal(hrefFor('literacy'), '/ai-literacy')
  assert.equal(hrefFor('platform', 'forge'), '/platform#forge')
  assert.equal(hrefFor('platform', { hash: '#forge' }), '/platform#forge')
  assert.equal(hrefFor('article', { slug: 'the-readiness-gap' }), '/blog/the-readiness-gap')
  assert.equal(hrefFor('caseStudy', { slug: 'x' }), '/case-studies/x')
  assert.equal(hrefFor('form', { slug: 'x' }), '/forms/x')
  assert.equal(hrefFor('ai-readiness-day'), '/ai-readiness-day') // CMS-built page
})

test('hrefFor ignores a missing or empty hash', () => {
  assert.equal(hrefFor('contact', undefined), '/contact')
  assert.equal(hrefFor('contact', { hash: '' }), '/contact')
})

test('pageKeyForPath resolves fixed routes and ignores trailing slashes', () => {
  assert.equal(pageKeyForPath('/'), 'home')
  assert.equal(pageKeyForPath('/the-lab/'), 'proxalab')
  assert.equal(pageKeyForPath('/news'), 'newsHub')
  assert.equal(pageKeyForPath('/nope'), null)
})

test('pageKeyForPath gives no key for slug routes, as the old router did', () => {
  assert.equal(pageKeyForPath('/blog/some-post'), null)
})

test('the admin path is not a public page key', () => {
  assert.equal(PAGE_PATHS.admin, undefined)
})

test('every fixed route and system path is a reserved slug', () => {
  for (const path of Object.values(PAGE_PATHS)) {
    if (path !== '/') assert.ok(RESERVED_SLUGS.has(path.slice(1)), `${path} should be reserved`)
  }
  for (const slug of ['admin', 'api', 'next', 'media', 'assets', 'forms', 'proxa-labs', 'letsmeet']) {
    assert.ok(RESERVED_SLUGS.has(slug), `${slug} should be reserved`)
  }
  assert.ok(!RESERVED_SLUGS.has('ai-readiness-day'))
})
