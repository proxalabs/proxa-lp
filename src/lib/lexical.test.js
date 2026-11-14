import assert from 'node:assert/strict'
import { test } from 'node:test'

import { bodyToLexical, lexicalToBody, lexicalToHtml, lexicalToText, readTimeFor } from './lexical.js'

const text = (t, format = 0) => ({ type: 'text', text: t, format, version: 1 })
const para = (...children) => ({ type: 'paragraph', children, version: 1 })
const heading = (tag, t) => ({ type: 'heading', tag, children: [text(t)], version: 1 })
const state = (...children) => ({ root: { type: 'root', children, version: 1 } })

test('paragraph formatting becomes html', () => {
  const { body } = lexicalToBody(state(para(text('Plain '), text('bold', 1), text(' and '), text('both', 3))))
  assert.deepEqual(body, [{ type: 'p', html: 'Plain <strong>bold</strong> and <strong><em>both</em></strong>' }])
})

test('text is escaped, so markup typed by an editor cannot run', () => {
  const { body } = lexicalToBody(state(para(text('<script>alert(1)</script> & "quotes"'))))
  assert.equal(body[0].html, '&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;quotes&quot;')
})

test('links keep safe urls and drop dangerous ones', () => {
  const link = (url, newTab = false) => ({ type: 'link', fields: { linkType: 'custom', url, newTab }, children: [text('here')], version: 3 })
  const { body } = lexicalToBody(state(
    para(link('https://example.com/a?b=1&c=2', true)),
    para(link('/contact')),
    para(link('javascript:alert(1)')),
  ))
  assert.equal(body[0].html, '<a href="https://example.com/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">here</a>')
  assert.equal(body[1].html, '<a href="/contact">here</a>')
  assert.equal(body[2].html, 'here')
})

test('internal links resolve to the document address', () => {
  const link = { type: 'link', fields: { linkType: 'internal', doc: { relationTo: 'posts', value: { slug: 'the-readiness-gap' } } }, children: [text('post')], version: 3 }
  const page = { type: 'link', fields: { linkType: 'internal', doc: { relationTo: 'pages', value: { slug: 'ai-day' } } }, children: [text('page')], version: 3 }
  const { body } = lexicalToBody(state(para(link, text(' '), page)))
  assert.equal(body[0].html, '<a href="/blog/the-readiness-gap">post</a> <a href="/ai-day">page</a>')
})

test('headings build the table of contents with unique ids', () => {
  const { body, toc } = lexicalToBody(state(heading('h2', 'Overview'), heading('h3', 'Detail'), heading('h2', 'Overview')))
  assert.deepEqual(body, [
    { type: 'h2', level: 2, id: 'overview', text: 'Overview' },
    { type: 'h2', level: 3, id: 'detail', text: 'Detail' },
    { type: 'h2', level: 2, id: 'overview-2', text: 'Overview' },
  ])
  assert.deepEqual(toc, [{ id: 'overview', label: 'Overview' }, { id: 'overview-2', label: 'Overview' }])
})

test('quotes, lists, images and blocks map through', () => {
  const { body } = lexicalToBody(state(
    { type: 'quote', children: [text('Evidence first.')], version: 1 },
    { type: 'list', listType: 'bullet', tag: 'ul', children: [
      { type: 'listitem', children: [text('One')], version: 1 },
      { type: 'listitem', children: [text('Two', 1)], version: 1 },
    ], version: 1 },
    { type: 'upload', relationTo: 'media', value: { url: '/api/media/file/a.png', alt: 'A chart' }, fields: { caption: 'Fig. 1' }, version: 3 },
    { type: 'block', fields: { blockType: 'takeaways', items: [{ text: 'T1' }, { text: 'T2' }] }, version: 2 },
    { type: 'block', fields: { blockType: 'faq', items: [{ question: 'Q?', answer: 'A.' }] }, version: 2 },
  ))
  assert.deepEqual(body, [
    { type: 'quote', text: 'Evidence first.' },
    { type: 'html', html: '<ul><li>One</li><li><strong>Two</strong></li></ul>' },
    { type: 'image', src: '/api/media/file/a.png', alt: 'A chart', caption: 'Fig. 1' },
    { type: 'takeaways', items: ['T1', 'T2'] },
    { type: 'faq', items: [{ q: 'Q?', a: 'A.' }] },
  ])
})

test('empty paragraphs and unknown nodes are skipped, not rendered blank', () => {
  const { body } = lexicalToBody(state(para(), para(text('   ')), { type: 'mystery', version: 1 }, para(text('Real'))))
  assert.deepEqual(body, [{ type: 'p', html: 'Real' }])
})

test('missing or malformed rich text gives an empty body', () => {
  assert.deepEqual(lexicalToBody(null), { body: [], toc: [] })
  assert.deepEqual(lexicalToBody({}), { body: [], toc: [] })
  assert.equal(lexicalToHtml(undefined), '')
  assert.equal(lexicalToText(undefined), '')
})

test('lexicalToHtml renders paragraphs and lists as block html', () => {
  const html = lexicalToHtml(state(para(text('One')), para(text('Two', 2))))
  assert.equal(html, '<p>One</p><p><em>Two</em></p>')
})

test('lexicalToText gives plain words for descriptions and search', () => {
  assert.equal(lexicalToText(state(heading('h2', 'Title'), para(text('Hello '), text('world', 1)))), 'Title Hello world')
})

test('readTimeFor counts about 200 words a minute, never zero', () => {
  assert.equal(readTimeFor(''), '1 min read')
  assert.equal(readTimeFor(Array(450).fill('word').join(' ')), '3 min read')
})

test('bodyToLexical round-trips the old article body', () => {
  const body = [
    { type: 'p', html: 'Plain <strong>bold</strong> and <em>italic</em> with <a href="https://example.com">a link</a>.' },
    { type: 'h2', level: 2, id: 'why-it-matters', text: 'Why it matters' },
    { type: 'h2', level: 3, id: 'a-smaller-point', text: 'A smaller point' },
    { type: 'quote', text: 'Evidence first.' },
    { type: 'image', src: '/img/a.png', alt: 'A chart', caption: 'Fig. 1' },
    { type: 'takeaways', items: ['T1', 'T2'] },
    { type: 'faq', items: [{ q: 'Q?', a: 'A.' }] },
  ]
  const lexical = bodyToLexical(body, { image: (b) => ({ url: b.src, alt: b.alt }) })
  assert.deepEqual(lexicalToBody(lexical).body, body)
})

test('bodyToLexical understands the old html tags and entities', () => {
  const lexical = bodyToLexical([{ type: 'p', html: '<b>B</b> <i>I</i> A &amp; B&nbsp;&mdash; &#8220;q&#8221;<br>next' }])
  assert.equal(lexicalToBody(lexical).body[0].html, '<strong>B</strong> <em>I</em> A &amp; B — “q”<br>next')
})

// The old editor stored a whole run of paragraphs, and even lists, inside one
// "p" block as contenteditable markup. The import has to split it back out.
test('bodyToLexical splits div-separated text into real paragraphs', () => {
  const html = 'First part.<div><br></div><div>Second <strong>part</strong>.</div><div><br></div><div>Third part.</div>'
  const { body } = lexicalToBody(bodyToLexical([{ type: 'p', html }]))
  assert.deepEqual(body, [
    { type: 'p', html: 'First part.' },
    { type: 'p', html: 'Second <strong>part</strong>.' },
    { type: 'p', html: 'Third part.' },
  ])
})

test('bodyToLexical turns an embedded list into a real list', () => {
  const html = 'Intro line.<div><ul><li><strong>One</strong> first</li><li>Two</li></ul></div><div>After.</div>'
  const { body } = lexicalToBody(bodyToLexical([{ type: 'p', html }]))
  assert.deepEqual(body, [
    { type: 'p', html: 'Intro line.' },
    { type: 'html', html: '<ul><li><strong>One</strong> first</li><li>Two</li></ul>' },
    { type: 'p', html: 'After.' },
  ])
})

test('bodyToLexical unwraps a paragraph tag and splits on double line breaks', () => {
  const wrapped = lexicalToBody(bodyToLexical([{ type: 'p', html: '<p>KING OF PRUSSIA — news with <a href="https://x.example">a link</a>.</p>' }])).body
  assert.deepEqual(wrapped, [{ type: 'p', html: 'KING OF PRUSSIA — news with <a href="https://x.example">a link</a>.' }])
  const broken = lexicalToBody(bodyToLexical([{ type: 'p', html: 'Line one.<br><br>Line two.<br>still two.' }])).body
  assert.deepEqual(broken, [{ type: 'p', html: 'Line one.' }, { type: 'p', html: 'Line two.<br>still two.' }])
})

test('short contents labels replace long headings in the table of contents, in order', () => {
  const s = state(heading('h2', 'Commercial and learning define what capable means'), heading('h3', 'A detail'), heading('h2', 'Where to start'), heading('h2', 'Third heading'))
  const { toc, body } = lexicalToBody(s, { tocLabels: ['Defining capable', '  ', undefined] })
  assert.deepEqual(toc, [
    { id: 'commercial-and-learning-define-what-capable-means', label: 'Defining capable' },
    { id: 'where-to-start', label: 'Where to start' }, // blank label falls back to the heading
    { id: 'third-heading', label: 'Third heading' },
  ])
  // The headings themselves are untouched.
  assert.equal(body[0].text, 'Commercial and learning define what capable means')
})

test('a body image carries its pixel size when the media has one, so the page can reserve the space', () => {
  const upload = (value) => ({ type: 'upload', relationTo: 'media', value, fields: {}, version: 3 })
  const { body } = lexicalToBody(state(upload({ url: '/a.png', alt: 'A', width: 1600, height: 900 }), upload({ url: '/b.png', alt: 'B' })))
  assert.deepEqual(body[0], { type: 'image', src: '/a.png', alt: 'A', caption: '', width: 1600, height: 900 })
  assert.deepEqual(body[1], { type: 'image', src: '/b.png', alt: 'B', caption: '' })
})
