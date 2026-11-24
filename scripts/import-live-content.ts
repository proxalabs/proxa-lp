// One-off import of the live (Firebase) site's published content into Payload.
//
//   npx payload run scripts/import-live-content.ts            # add what is missing
//   npx payload run scripts/import-live-content.ts -- --update # also overwrite existing posts
//
// It only READS the live site, through the same public endpoints a visitor's
// browser uses: the published-content query and /api/content. Nothing on Firebase
// is changed. Safe to run again: documents are matched by slug / name / filename.
//
// Imported: blog posts (with authors, categories and images), case studies,
// videos, the copy and SEO overrides for the fixed pages, the header menus and
// the redirect rules. Not imported: built landing pages and forms (the live site
// has none).

import config from '@payload-config'
import { randomBytes } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import { MANIFEST, defaultsFor } from '../src/content/manifest.js'
import { NAV_DESTINATIONS } from '../src/content/navConfig.js'
import { bodyToLexical, htmlToLexical } from '../src/lib/lexical.js'
import { fieldName } from '../src/lib/pageContent.js'

const SOURCE = (process.env.IMPORT_SOURCE || 'https://insite-hub-web.web.app').replace(/\/+$/, '')
// The site's public web config (it ships in the old site's JavaScript). Reads are
// limited to published documents by the Firestore rules.
const FIRESTORE_QUERY =
  'https://firestore.googleapis.com/v1/projects/insite-hub-web/databases/(default)/documents:runQuery?key=AIzaSyAiaiu1-ZppLCV8UUqmvGg-Ti5XZGifkn8'
const UPDATE = process.argv.includes('--update')

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const payload = await getPayload({ config })
// There is no Next.js request to revalidate from; the server picks changes up itself.
const context = { disableRevalidate: true }
const log = (...args: unknown[]) => console.log(...args)
const newId = () => randomBytes(12).toString('hex')

// ── reading the live site ───────────────────────────────────────────────────

function decode(v: Doc): unknown {
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('timestampValue' in v) return v.timestampValue
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode)
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, decode(x as Doc)]))
  return null
}

async function published(collectionId: string): Promise<Doc[]> {
  const res = await fetch(FIRESTORE_QUERY, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } },
      },
    }),
  })
  if (!res.ok) throw new Error(`could not read ${collectionId}: HTTP ${res.status}`)
  const rows = (await res.json()) as Doc[]
  return rows
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document.name.split('/').pop(),
      ...Object.fromEntries(Object.entries(r.document.fields || {}).map(([k, v]) => [k, decode(v as Doc)])),
    }))
}

// ── helpers ─────────────────────────────────────────────────────────────────

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.vtt': 'text/vtt' }

/** "…/o/blog%2F1787-john.jpg?alt=media" → "1787-john.jpg" */
const fileName = (src: string) => decodeURIComponent(src.split('?')[0].split('/').pop() || 'file').split('/').pop() || 'file'

const mediaCache = new Map<string, number | null>()

/** The media id for an image used by the old site, uploading it the first time. */
async function ensureMedia(src: unknown, alt: string): Promise<number | null> {
  if (typeof src !== 'string' || !src.trim()) return null
  if (mediaCache.has(src)) return mediaCache.get(src)!
  const name = fileName(src)
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, pagination: false })
  if (existing.docs[0]) {
    mediaCache.set(src, existing.docs[0].id)
    return existing.docs[0].id
  }
  try {
    // A site-relative path is one of the repo's own public files.
    const data = src.startsWith('/')
      ? await readFile(path.join(process.cwd(), 'public', src))
      : Buffer.from(await (await fetch(src)).arrayBuffer())
    const mimetype = MIME[path.extname(name).toLowerCase()] || 'application/octet-stream'
    const doc = await payload.create({ collection: 'media', data: { alt: alt || name }, file: { data, mimetype, name, size: data.length }, context })
    log(`  + media ${name}`)
    mediaCache.set(src, doc.id)
    return doc.id
  } catch (err) {
    log(`  ! could not import image ${src.slice(0, 80)} — ${String(err).slice(0, 80)}`)
    mediaCache.set(src, null)
    return null
  }
}

/** "June 22, 2026" → that calendar day at noon UTC, so no timezone can shift it. */
function toDate(display: unknown): string | undefined {
  const t = Date.parse(String(display || ''))
  if (Number.isNaN(t)) return undefined
  const d = new Date(t)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12)).toISOString()
}

/** Find a category or author by its unique name, creating it (lazily) if it is new. */
async function findOrCreate(collection: 'categories' | 'authors', field: 'title' | 'name', value: string, build: () => Promise<Doc>): Promise<number> {
  const found = await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1, pagination: false })
  if (found.docs[0]) return found.docs[0].id
  const doc = await payload.create({ collection, data: (await build()) as never, context })
  log(`  + ${collection} "${value}"`)
  return doc.id
}

const exists = async (collection: 'posts' | 'case-studies' | 'videos', slug: string) =>
  (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, pagination: false, draft: true })).docs[0]

const seo = async (doc: Doc, fallbackAlt: string) => ({
  title: doc.metaTitle || undefined,
  description: doc.description || undefined,
  image: await ensureMedia(doc.ogImage, fallbackAlt),
  canonical: doc.canonical || undefined,
  noindex: Boolean(doc.noindex),
})

// ── posts ───────────────────────────────────────────────────────────────────

// The old site kept hand-written short labels for the "in this article" list.
// Keep each one that differs from its heading, matched to the h2s in order.
function tocLabels(a: Doc): { label: string }[] {
  const byId = new Map<string, string>((a.toc || []).map((t: Doc) => [t.id, t.label]))
  const labels = (a.body || [])
    .filter((b: Doc) => b.type === 'h2' && (b.level || 2) === 2)
    .map((b: Doc) => { const label = byId.get(b.id); return { label: label && label !== b.text ? label : '' } })
  return labels.some((l: { label: string }) => l.label) ? labels : []
}

async function importPosts(articles: Doc[]) {
  log(`\nBlog posts: ${articles.length} published on the live site`)
  // Newest first, so an author's profile comes from their most recent post.
  articles.sort((a, b) => Date.parse(b.date || '') - Date.parse(a.date || ''))

  for (const a of articles) {
    const current = await exists('posts', a.slug)
    if (current && !UPDATE) {
      log(`  = ${a.slug} (already imported)`)
      continue
    }
    const category = a.pillar ? await findOrCreate('categories', 'title', a.pillar, async () => ({ title: a.pillar })) : undefined
    // The profile (and its headshot) is only built the first time an author is seen.
    const author = a.author?.name
      ? await findOrCreate('authors', 'name', a.author.name, async () => ({
          name: a.author.name,
          title: a.author.role || '',
          bio: a.author.bio || '',
          headshot: await ensureMedia(a.author.headshot, a.author.name),
        }))
      : undefined

    const images = new Map<string, number | null>()
    for (const b of a.body || []) if (b.type === 'image') images.set(b.src, await ensureMedia(b.src, b.alt || a.title))

    const data = {
      title: a.title,
      slug: a.slug,
      _status: 'published' as const,
      category,
      topic: a.topic || undefined,
      tags: Array.isArray(a.tags) ? a.tags : [],
      author,
      hideAuthor: Boolean(a.hideAuthor),
      featured: Boolean(a.featured),
      order: typeof a.order === 'number' ? a.order : undefined,
      publishedDate: toDate(a.date),
      readTime: a.readTime || undefined,
      summary: a.summary ? htmlToLexical(a.summary) : undefined,
      hideSummary: Boolean(a.hideSummary),
      heroImage: await ensureMedia(a.thumb, a.title),
      showHero: Boolean(a.showHero),
      cardImage: await ensureMedia(a.cardImage, a.title),
      content: bodyToLexical(a.body || [], { image: (b: Doc) => images.get(b.src) ?? null, id: newId }),
      tocLabels: tocLabels(a),
      meta: await seo(a, a.title),
    }
    if (current) await payload.update({ collection: 'posts', id: current.id, data: data as never, context })
    else await payload.create({ collection: 'posts', data: data as never, context })
    log(`  ${current ? '~' : '+'} ${a.slug}`)
  }
}

// ── case studies and videos ─────────────────────────────────────────────────

async function importCaseStudies(list: Doc[]) {
  log(`\nCase studies: ${list.length} published on the live site`)
  for (const c of list) {
    if ((await exists('case-studies', c.slug)) && !UPDATE) { log(`  = ${c.slug} (already imported)`); continue }
    const data = {
      title: c.title, slug: c.slug, _status: 'published' as const, client: c.client, industry: c.industry, summary: c.summary,
      stats: (c.stats || []).map((s: Doc) => ({ value: s.value, label: s.label })),
      challenge: c.challenge, solution: c.solution, results: c.results,
      heroImage: await ensureMedia(c.heroImage, c.title), publishedDate: toDate(c.date),
      order: typeof c.order === 'number' ? c.order : undefined, meta: { ...(await seo(c, c.title)), description: undefined },
    }
    const current = await exists('case-studies', c.slug)
    if (current) await payload.update({ collection: 'case-studies', id: current.id, data: data as never, context })
    else await payload.create({ collection: 'case-studies', data: data as never, context })
    log(`  + ${c.slug}`)
  }
}

async function importVideos(list: Doc[]) {
  log(`\nVideos: ${list.length} published on the live site`)
  for (const v of list) {
    const slug = v.slug || v.id
    if ((await exists('videos', slug)) && !UPDATE) { log(`  = ${slug} (already imported)`); continue }
    const data = {
      title: v.title, slug, _status: 'published' as const, videoUrl: v.videoUrl, length: v.length, topic: v.topic,
      description: v.description, transcript: v.transcript, publishedDate: toDate(v.date),
      thumbnail: await ensureMedia(v.thumbnail, v.title), captions: await ensureMedia(v.captions, `${v.title} captions`),
      order: typeof v.order === 'number' ? v.order : undefined, noindex: Boolean(v.noindex),
    }
    const current = await exists('videos', slug)
    if (current) await payload.update({ collection: 'videos', id: current.id, data: data as never, context })
    else await payload.create({ collection: 'videos', data: data as never, context })
    log(`  + ${slug}`)
  }
}

// ── fixed-page copy, header menus, redirects ────────────────────────────────

async function importSiteContent(content: Doc) {
  const manifest = MANIFEST as Record<string, { label: string; fields: { key: string; type: string }[] }>
  log('\nFixed-page copy and SEO overrides')
  for (const [pageId, page] of Object.entries(manifest)) {
    const saved = content[pageId] as Doc | undefined
    if (!saved) continue
    const defaults = defaultsFor(pageId) as Record<string, string>
    const data: Doc = {}
    let count = 0
    for (const field of page.fields) {
      const value = saved[field.key]
      // Only real overrides: an empty value, or one equal to the built-in copy, is not one.
      if (value == null || String(value).trim() === '' || value === defaults[field.key]) continue
      data[fieldName(field.key)] = field.type === 'image' ? await ensureMedia(value, `${page.label}: ${field.key}`) : String(value)
      count++
    }
    const pageSeo = {
      title: saved.seoTitle || undefined,
      description: saved.seoDescription || undefined,
      image: await ensureMedia(saved.seoImage, `${page.label} share image`),
      noindex: Boolean(saved.seoNoindex),
    }
    await payload.updateGlobal({ slug: `page-${pageId}` as 'page-home', data: { ...data, seo: pageSeo } as never, context })
    log(`  ~ ${page.label}: ${count} override(s)`)
  }

  const menus = content.nav?.menus as Record<string, { label: string; page: string }[]> | undefined
  if (menus) {
    const known = new Set((NAV_DESTINATIONS as { page: string }[]).map((d) => d.page))
    const rows = (list: { label: string; page: string }[] = []) => list.filter((i) => i?.label && known.has(i.page)).map((i) => ({ label: i.label, linkPage: i.page }))
    await payload.updateGlobal({ slug: 'navigation', data: { platform: rows(menus.platform), solutions: rows(menus.solutions), resources: rows(menus.resources) } as never, context })
    log('  ~ header menus')
  }

  const rules = (content.redirects?.rules || []) as { from?: string; to?: string }[]
  for (const rule of rules) {
    if (!rule?.from || !rule?.to) continue
    const found = await payload.find({ collection: 'redirects', where: { from: { equals: rule.from } }, limit: 1, pagination: false })
    if (found.docs[0]) continue
    await payload.create({ collection: 'redirects', data: { from: rule.from, to: { type: 'custom', url: rule.to } }, context })
    log(`  + redirect ${rule.from} → ${rule.to}`)
  }
}

// ── run ─────────────────────────────────────────────────────────────────────

log(`Importing published content from ${SOURCE} (read-only)`)
const [articles, caseStudies, videos, content] = await Promise.all([
  published('articles'),
  published('caseStudies'),
  published('videos'),
  fetch(`${SOURCE}/api/content`).then((r) => (r.ok ? r.json() : {})) as Promise<Doc>,
])
await importPosts(articles)
await importCaseStudies(caseStudies)
await importVideos(videos)
await importSiteContent(content)
log('\nDone.')
process.exit(0)
