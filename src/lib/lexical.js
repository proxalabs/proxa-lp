// Converts the CMS rich text (Lexical editor state) into what the site renders,
// and back again for the one-off content import. Pure functions, no DOM.
//
// Safety: every piece of text is escaped and only a fixed set of tags is ever
// emitted, so this output is safe to pass to dangerouslySetInnerHTML.

import { slugify } from '../fields/slugRules.js'

const BOLD = 1
const ITALIC = 2
const STRIKE = 4
const UNDERLINE = 8
const CODE = 16

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Where each linkable collection lives on the site.
const DOC_PREFIX = { posts: '/blog', 'case-studies': '/case-studies', pages: '' }

/** The href for a link node, or null when it is missing or not a safe URL. */
function linkHref(fields) {
  if (!fields) return null
  if (fields.linkType === 'internal') {
    const doc = fields.doc
    const slug = doc && doc.value && typeof doc.value === 'object' ? doc.value.slug : null
    if (!slug || !(doc.relationTo in DOC_PREFIX)) return null
    return `${DOC_PREFIX[doc.relationTo]}/${slug}`
  }
  const url = String(fields.url || '').trim()
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : null
}

/** Inline nodes (text, links, line breaks) → an html string. */
function inline(nodes) {
  return (nodes || [])
    .map((n) => {
      if (n.type === 'text') {
        let h = esc(n.text || '')
        const f = n.format || 0
        if (f & CODE) h = `<code>${h}</code>`
        if (f & UNDERLINE) h = `<u>${h}</u>`
        if (f & STRIKE) h = `<s>${h}</s>`
        if (f & ITALIC) h = `<em>${h}</em>`
        if (f & BOLD) h = `<strong>${h}</strong>`
        return h
      }
      if (n.type === 'linebreak') return '<br>'
      if (n.type === 'link' || n.type === 'autolink') {
        const inner = inline(n.children)
        const href = linkHref(n.fields)
        if (!href) return inner
        const newTab = n.fields.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
        return `<a href="${esc(href)}"${newTab}>${inner}</a>`
      }
      return n.children ? inline(n.children) : ''
    })
    .join('')
}

/** All the text under a list of nodes, as plain words. */
function plain(nodes) {
  return (nodes || [])
    .map((n) => (n.type === 'text' ? n.text || '' : n.type === 'linebreak' ? ' ' : n.children ? plain(n.children) : ''))
    .join('')
}

function listHtml(node) {
  const tag = node.listType === 'number' || node.tag === 'ol' ? 'ol' : 'ul'
  const items = (node.children || [])
    .map((item) => {
      // A list item holds inline content and, for nesting, further lists.
      const inner = (item.children || []).map((c) => (c.type === 'list' ? listHtml(c) : inline([c]))).join('')
      return `<li>${inner}</li>`
    })
    .join('')
  return `<${tag}>${items}</${tag}>`
}

const rootChildren = (state) => (state && state.root && Array.isArray(state.root.children) ? state.root.children : [])

/**
 * An article body in the shape ArticleLayout renders, plus its table of contents
 * (the h2s). Heading ids are made from the heading text and kept unique.
 * `opts.tocLabels` are optional short labels for the contents list, one per h2 in
 * order; a missing or blank one falls back to the heading text.
 * @param {unknown} state Lexical editor state from a `richText` field (populated).
 * @param {{ tocLabels?: (string | null | undefined)[] }} [opts]
 * @returns {{ body: object[], toc: { id: string, label: string }[] }}
 */
export function lexicalToBody(state, opts = {}) {
  const body = []
  const toc = []
  const labels = opts.tocLabels || []
  const used = new Map()
  const uniqueId = (text) => {
    const base = slugify(text) || 'section'
    const n = (used.get(base) || 0) + 1
    used.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }

  for (const node of rootChildren(state)) {
    if (node.type === 'paragraph') {
      if (plain(node.children).trim()) body.push({ type: 'p', html: inline(node.children) })
    } else if (node.type === 'heading') {
      const text = plain(node.children).trim()
      if (!text) continue
      const level = node.tag === 'h3' ? 3 : node.tag === 'h4' ? 4 : 2
      const id = uniqueId(text)
      body.push({ type: 'h2', level, id, text })
      if (level === 2) toc.push({ id, label: String(labels[toc.length] || '').trim() || text })
    } else if (node.type === 'quote') {
      const text = plain(node.children).trim()
      if (text) body.push({ type: 'quote', text })
    } else if (node.type === 'list') {
      body.push({ type: 'html', html: listHtml(node) })
    } else if (node.type === 'upload') {
      const media = node.value && typeof node.value === 'object' ? node.value : null
      if (media && media.url) {
        body.push({ type: 'image', src: media.url, alt: media.alt || '', caption: (node.fields && node.fields.caption) || '' })
      }
    } else if (node.type === 'block' && node.fields) {
      const items = Array.isArray(node.fields.items) ? node.fields.items : []
      if (node.fields.blockType === 'takeaways') {
        const list = items.map((i) => i.text).filter(Boolean)
        if (list.length) body.push({ type: 'takeaways', items: list })
      } else if (node.fields.blockType === 'faq') {
        const list = items.filter((i) => i.question && i.answer).map((i) => ({ q: i.question, a: i.answer }))
        if (list.length) body.push({ type: 'faq', items: list })
      }
    }
  }
  return { body, toc }
}

/**
 * Simple formatted copy as block html (paragraphs, lists, sub-headings).
 * @param {unknown} state
 * @returns {string}
 */
export function lexicalToHtml(state) {
  return rootChildren(state)
    .map((node) => {
      if (node.type === 'paragraph') return plain(node.children).trim() ? `<p>${inline(node.children)}</p>` : ''
      if (node.type === 'heading') return `<${node.tag === 'h4' ? 'h4' : 'h3'}>${inline(node.children)}</${node.tag === 'h4' ? 'h4' : 'h3'}>`
      if (node.type === 'quote') return `<blockquote>${inline(node.children)}</blockquote>`
      if (node.type === 'list') return listHtml(node)
      return ''
    })
    .join('')
}

/**
 * Formatted copy for a spot that is already inside a <p>: paragraphs are joined
 * with line breaks instead of being wrapped.
 * @param {unknown} state
 * @returns {string}
 */
export function lexicalToInlineHtml(state) {
  return rootChildren(state)
    .filter((node) => plain(node.children).trim())
    .map((node) => inline(node.children))
    .join('<br><br>')
}

/**
 * Plain words, for descriptions, search and read-time.
 * @param {unknown} state
 * @returns {string}
 */
export function lexicalToText(state) {
  const parts = []
  for (const node of rootChildren(state)) {
    if (node.type === 'block' && node.fields && Array.isArray(node.fields.items)) {
      for (const i of node.fields.items) parts.push(i.text, i.question, i.answer)
    } else if (node.type === 'list') {
      for (const item of node.children || []) parts.push(plain(item.children))
    } else {
      parts.push(plain(node.children))
    }
  }
  return parts.map((p) => (p || '').trim()).filter(Boolean).join(' ')
}

/**
 * "6 min read" from an article's text, at about 200 words a minute.
 * @param {string} text
 * @returns {string}
 */
export function readTimeFor(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

// ── Import direction: the old article body → Lexical ────────────────────────

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', copy: '©', reg: '®', trade: '™',
}

const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })

const TAG_FORMAT = { b: BOLD, strong: BOLD, i: ITALIC, em: ITALIC, s: STRIKE, strike: STRIKE, del: STRIKE, u: UNDERLINE, code: CODE }

const textNode = (text, format = 0) => ({ type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 })
const element = (type, children, extra = {}) => ({ type, children, direction: 'ltr', format: '', indent: 0, version: 1, ...extra })

/** The inline html the old editor produced (b/strong, i/em, u, a, br) → Lexical nodes. */
function parseInline(html) {
  const out = []
  let format = 0
  let link = null
  const tokens = String(html || '').match(/<\/?[a-zA-Z][^>]*>|[^<]+|</g) || []
  for (const tok of tokens) {
    const tag = /^<(\/?)([a-zA-Z0-9]+)([^>]*)>$/.exec(tok)
    if (!tag) {
      const text = decode(tok)
      if (text) (link ? link.children : out).push(textNode(text, format))
      continue
    }
    const closing = tag[1] === '/'
    const name = tag[2].toLowerCase()
    if (TAG_FORMAT[name]) {
      format = closing ? format & ~TAG_FORMAT[name] : format | TAG_FORMAT[name]
    } else if (name === 'br') {
      (link ? link.children : out).push({ type: 'linebreak', version: 1 })
    } else if (name === 'a') {
      if (closing) {
        link = null
      } else {
        const href = /href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i.exec(tag[3])
        link = element('link', [], {
          version: 3,
          fields: { linkType: 'custom', url: decode(href ? href[1] ?? href[2] : ''), newTab: /target\s*=\s*["']?_blank/i.test(tag[3]) },
        })
        out.push(link)
      }
    }
    // Any other tag is dropped; the text inside it is kept.
  }
  return out
}

const paragraph = (html) => element('paragraph', parseInline(html), { textFormat: 0, textStyle: '' })
const hasText = (html) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() !== ''

/**
 * The old editor saved a run of paragraphs (and lists) inside one block as
 * contenteditable markup: `text<div><br></div><div>more</div><div><ul>…</ul></div>`.
 * This splits that back into real paragraph and list nodes.
 */
function htmlToBlocks(html) {
  const BREAK = '\u0000'
  const nodes = []
  // Lists first (they are never nested in this content), then everything between.
  for (const part of String(html || '').split(/(<ul[\s\S]*?<\/ul>|<ol[\s\S]*?<\/ol>)/i)) {
    const list = /^<(ul|ol)/i.exec(part)
    if (list) {
      const tag = list[1].toLowerCase()
      const items = [...part.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]).filter(hasText)
      if (items.length) {
        nodes.push(element('list', items.map((item, i) => element('listitem', parseInline(item), { value: i + 1 })), { listType: tag === 'ol' ? 'number' : 'bullet', tag, start: 1 }))
      }
      continue
    }
    const pieces = part
      .replace(/<\/?(div|p)\b[^>]*>/gi, BREAK) // block boundaries
      .replace(/(<br\s*\/?>\s*){2,}/gi, BREAK) // a blank line
      .split(BREAK)
      .map((piece) => piece.replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/gi, ''))
    for (const piece of pieces) if (hasText(piece)) nodes.push(paragraph(piece))
  }
  return nodes
}

/**
 * The old article body (array of blocks) → Lexical editor state.
 * `opts.image(block)` returns the upload value for an image block (a media id, or
 * a populated media object), or null to skip it. `opts.id()` makes block ids.
 * @param {object[]} body
 * @param {{ image?: (block: object) => unknown, id?: () => string }} [opts]
 */
export function bodyToLexical(body, opts = {}) {
  const withId = (fields) => (opts.id ? { id: opts.id(), ...fields } : fields)
  const children = []
  for (const b of body || []) {
    if (b.type === 'h2') {
      children.push(element('heading', [textNode(b.text || '')], { tag: b.level === 3 ? 'h3' : b.level === 4 ? 'h4' : 'h2' }))
    } else if (b.type === 'quote') {
      children.push(element('quote', [textNode(b.text || '')]))
    } else if (b.type === 'image') {
      const value = opts.image ? opts.image(b) : null
      if (value != null) children.push({ type: 'upload', relationTo: 'media', value, fields: { caption: b.caption || '' }, format: '', version: 3, ...(opts.id ? { id: opts.id() } : {}) })
    } else if (b.type === 'takeaways') {
      children.push({ type: 'block', format: '', version: 2, fields: withId({ blockType: 'takeaways', blockName: '', items: (b.items || []).map((text) => withId({ text })) }) })
    } else if (b.type === 'faq') {
      children.push({ type: 'block', format: '', version: 2, fields: withId({ blockType: 'faq', blockName: '', items: (b.items || []).map((f) => withId({ question: f.q, answer: f.a })) }) })
    } else if (/<(div|p|ul|ol|li)\b|(<br\s*\/?>\s*){2,}/i.test(b.html || '')) {
      children.push(...htmlToBlocks(b.html))
    } else {
      children.push(paragraph(b.html))
    }
  }
  return { root: element('root', children) }
}

/**
 * A plain string or simple html → Lexical state (summaries and other short copy).
 * @param {string} html
 */
export function htmlToLexical(html) {
  return { root: element('root', htmlToBlocks(String(html || '').replace(/\n{2,}/g, '<br><br>'))) }
}
