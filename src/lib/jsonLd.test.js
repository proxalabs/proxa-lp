import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildArticleLd, buildBreadcrumbLd, buildCollectionLd, buildFaqLd, buildPageLd, buildSiteLd, buildVideosLd, jsonLdString } from './jsonLd.js'

test('jsonLdString cannot close its own script tag', () => {
  const out = jsonLdString({ name: '</script><script>alert(1)</script>' })
  assert.ok(!out.includes('</script>'))
  assert.ok(!out.includes('<'))
})

test('jsonLdString still parses back to the same data', () => {
  const data = { '@type': 'Article', headline: 'A < B & "C"', n: 3 }
  assert.deepEqual(JSON.parse(jsonLdString(data)), data)
})

// ── builders ────────────────────────────────────────────────────────────────
const SITE = 'https://www.proxalabs.com'

test('the site graph describes the organisation and a searchable website', () => {
  const graph = buildSiteLd()['@graph']
  const org = graph.find((n) => n['@type'] === 'Organization')
  const site = graph.find((n) => n['@type'] === 'WebSite')
  assert.equal(org['@id'], `${SITE}/#org`)
  assert.equal(org.logo.url, `${SITE}/assets/proxa_horiz.png`)
  assert.equal(site.publisher['@id'], `${SITE}/#org`)
  assert.equal(site.potentialAction['@type'], 'SearchAction')
  assert.equal(site.potentialAction.target.urlTemplate, `${SITE}/search?q={search_term_string}`)
})

test('an article is a BlogPosting with dates, an absolute image and its author', () => {
  const ld = buildArticleLd(
    { title: 'The Readiness Gap', description: 'Why it matters.', thumb: '/api/media/file/a.png', isoDate: '2026-06-22T00:00:00.000Z', updatedAt: '2026-07-01T10:00:00.000Z', author: { name: 'John Royer' }, pillar: 'Evidence', tags: ['ai', 'readiness'] },
    `${SITE}/blog/the-readiness-gap`,
  )
  assert.equal(ld['@type'], 'BlogPosting')
  assert.equal(ld.headline, 'The Readiness Gap')
  assert.deepEqual(ld.image, [`${SITE}/api/media/file/a.png`])
  assert.equal(ld.datePublished, '2026-06-22T00:00:00.000Z')
  assert.equal(ld.dateModified, '2026-07-01T10:00:00.000Z')
  assert.deepEqual(ld.author, { '@type': 'Person', name: 'John Royer' })
  assert.equal(ld.publisher['@id'], `${SITE}/#org`)
  assert.equal(ld.mainEntityOfPage['@id'], `${SITE}/blog/the-readiness-gap`)
  assert.equal(ld.articleSection, 'Evidence')
  assert.equal(ld.keywords, 'ai, readiness')
})

test('an article with a hidden or missing author is attributed to the organisation', () => {
  const hidden = buildArticleLd({ title: 'T', author: { name: 'Jane' }, hideAuthor: true }, `${SITE}/blog/t`)
  const none = buildArticleLd({ title: 'T', author: { name: '' } }, `${SITE}/blog/t`)
  for (const ld of [hidden, none]) assert.deepEqual(ld.author, { '@id': `${SITE}/#org` })
  assert.equal(none.datePublished, undefined)
  assert.equal(none.image, undefined)
})

test('a case study can be typed as a plain Article', () => {
  assert.equal(buildArticleLd({ title: 'T' }, `${SITE}/case-studies/t`, 'Article')['@type'], 'Article')
})

test('a very long headline is cut to what search engines accept', () => {
  assert.ok(buildArticleLd({ title: 'x'.repeat(200) }, `${SITE}/blog/x`).headline.length <= 110)
})

test('breadcrumbs are numbered in order', () => {
  const ld = buildBreadcrumbLd([{ name: 'Home', url: `${SITE}/` }, { name: 'Blog', url: `${SITE}/blog` }])
  assert.deepEqual(ld.itemListElement.map((i) => [i.position, i.name]), [[1, 'Home'], [2, 'Blog']])
})

test('FAQ data needs both a question and an answer', () => {
  assert.equal(buildFaqLd([]), null)
  assert.equal(buildFaqLd([{ q: 'Q?', a: '' }]), null)
  assert.equal(buildFaqLd([{ q: 'Q?', a: 'A.' }]).mainEntity[0].acceptedAnswer.text, 'A.')
})

test('videos without a thumbnail or date are left out rather than emitted invalid', () => {
  const ld = buildVideosLd([
    { title: 'YouTube one', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isoDate: '2026-06-01T00:00:00.000Z', description: 'D', transcript: 'T' },
    { title: 'No date', videoUrl: 'https://youtu.be/dQw4w9WgXcQ' },
    { title: 'No thumbnail', videoUrl: 'https://cdn.example.com/v.mp4', isoDate: '2026-06-01T00:00:00.000Z' },
    { title: 'Hidden', videoUrl: 'https://youtu.be/dQw4w9WgXcQ', isoDate: '2026-06-01T00:00:00.000Z', noindex: true },
  ])
  assert.equal(ld['@graph'].length, 1)
  const v = ld['@graph'][0]
  assert.equal(v.thumbnailUrl, 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
  assert.equal(v.embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ')
  assert.equal(v.uploadDate, '2026-06-01T00:00:00.000Z')
  assert.equal(v.transcript, 'T')
  assert.equal(buildVideosLd([]), null)
})

test('a service page names the organisation as its provider', () => {
  const ld = buildPageLd('advisory', { name: 'Advisory', description: 'D', url: `${SITE}/advisory` })
  assert.equal(ld['@type'], 'Service')
  assert.equal(ld.provider['@id'], `${SITE}/#org`)
  assert.equal(buildPageLd('about', { name: 'About', url: `${SITE}/about` })['@type'], 'AboutPage')
  assert.equal(buildPageLd('contact', { name: 'Contact', url: `${SITE}/contact` })['@type'], 'ContactPage')
  assert.equal(buildPageLd('resources', { name: 'Resources', url: `${SITE}/resources` })['@type'], 'WebPage')
})

test('a listing page carries its items in order', () => {
  const ld = buildCollectionLd({ name: 'Blog', url: `${SITE}/blog`, type: 'Blog' }, [{ name: 'A', url: `${SITE}/blog/a` }, { name: 'B', url: `${SITE}/blog/b` }])
  assert.equal(ld['@type'], 'Blog')
  assert.deepEqual(ld.mainEntity.itemListElement.map((i) => [i.position, i.url]), [[1, `${SITE}/blog/a`], [2, `${SITE}/blog/b`]])
})
