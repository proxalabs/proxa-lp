// Crawl-level check of the running site, the way a search engine sees it: plain
// HTTP requests, no JavaScript. Fails (exit 1) on the first class of problem that
// would hurt indexing.
//
//   node scripts/verify-site.mjs                 # http://localhost:3000
//   node scripts/verify-site.mjs https://staging.example.com
//
// It reads the site's own sitemap, so it also covers every published post, case
// study and landing page.

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '')
const CANONICAL_ORIGIN = 'https://www.proxalabs.com'

const FIXED = [
  '/', '/platform', '/advisory', '/ai-literacy', '/insitex-lms', '/content-development', '/the-lab', '/about',
  '/announcements', '/newsletter', '/contact', '/blog', '/news', '/case-studies', '/videos',
]
const NOINDEX = ['/future-proof-your-organization', '/innovation-collective', '/search']

let failures = 0
const fail = (path, msg) => { failures++; console.log(`FAIL ${path}  ${msg}`) }
const get = (path, opts) => fetch(base + path, { redirect: 'manual', ...opts })

const meta = (html, attr, key) => {
  const m = new RegExp(`<meta[^>]+${attr}="${key}"[^>]*>`, 'i').exec(html)
  return m ? (/content="([^"]*)"/i.exec(m[0]) || [])[1] ?? '' : null
}

/** Every JSON-LD block on the page, parsed. A block that does not parse is a failure. */
function jsonLd(path, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  const out = []
  for (const [, raw] of blocks) {
    try { out.push(JSON.parse(raw)) } catch { fail(path, 'structured data does not parse as JSON') }
  }
  return out
}
const types = (blocks) => blocks.flatMap((b) => (b['@graph'] ? b['@graph'] : [b])).map((n) => n['@type'])

async function checkPage(path, { indexable = true } = {}) {
  const res = await get(path)
  if (res.status !== 200) return fail(path, `status ${res.status}, expected 200`)
  const html = await res.text()

  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) fail(path, `${h1} <h1> elements, expected exactly 1`)

  const title = (/<title>([^<]*)<\/title>/.exec(html) || [])[1] || ''
  if (title.length < 10) fail(path, `title missing or too short: "${title}"`)

  const description = meta(html, 'name', 'description')
  if (indexable && (!description || description.length < 50)) fail(path, `meta description missing or under 50 characters`)

  const canonical = (/<link rel="canonical" href="([^"]*)"/.exec(html) || [])[1]
  const expected = CANONICAL_ORIGIN + (path === '/' ? '' : path)
  if (!canonical) fail(path, 'no canonical link')
  else if (indexable && canonical.replace(/\/$/, '') !== expected) fail(path, `canonical is ${canonical}, expected ${expected}`)

  const robots = meta(html, 'name', 'robots') || ''
  if (indexable && /noindex/.test(robots)) fail(path, 'page is marked noindex but should be indexable')
  if (!indexable && !/noindex/.test(robots)) fail(path, 'page should be noindex')

  for (const key of ['og:title', 'og:url', 'og:image', 'og:type']) if (!meta(html, 'property', key)) fail(path, `missing ${key}`)
  if (meta(html, 'name', 'twitter:card') !== 'summary_large_image') fail(path, 'missing twitter:card')
  const ogImage = meta(html, 'property', 'og:image') || ''
  if (ogImage && !/^https?:\/\//.test(ogImage)) fail(path, `og:image is not absolute: ${ogImage}`)

  if (!/<html[^>]+lang="en"/.test(html)) fail(path, 'html lang attribute missing')

  const ld = types(jsonLd(path, html))
  for (const t of ['Organization', 'WebSite']) if (!ld.includes(t)) fail(path, `no ${t} structured data`)
  if (indexable && path !== '/' && !ld.includes('BreadcrumbList')) fail(path, 'no BreadcrumbList structured data')

  // Internal links must be real anchors a crawler can follow.
  const links = new Set([...html.matchAll(/<a[^>]+href="(\/[^"#]*)/g)].map((m) => m[1]))
  for (const need of ['/platform', '/about', '/contact', '/blog']) if (!links.has(need)) fail(path, `no crawlable link to ${need}`)

  const imgsWithoutAlt = (html.match(/<img(?![^>]*\salt=)[^>]*>/g) || []).length
  if (imgsWithoutAlt) fail(path, `${imgsWithoutAlt} <img> without an alt attribute`)

  return { html, ld }
}

// ── pages ───────────────────────────────────────────────────────────────────
for (const path of FIXED) await checkPage(path)
for (const path of NOINDEX) await checkPage(path, { indexable: false })

// ── status codes ────────────────────────────────────────────────────────────
for (const path of ['/this-page-does-not-exist', '/blog/this-post-does-not-exist', '/case-studies/nope', '/a/b/c', '/wp-login.php']) {
  const res = await get(path)
  if (res.status !== 404) fail(path, `status ${res.status}, expected 404 (a soft 404 gets indexed)`)
  else if (!/noindex/.test(await res.text())) fail(path, '404 page is not marked noindex')
}
for (const [from, to] of [['/proxa-labs', '/the-lab'], ['/letsmeet', '/contact']]) {
  const res = await get(from)
  const location = res.headers.get('location') || ''
  if (![301, 308].includes(res.status) || !location.endsWith(to)) fail(from, `expected a permanent redirect to ${to}, got ${res.status} ${location}`)
}

// ── sitemap ─────────────────────────────────────────────────────────────────
{
  const res = await get('/sitemap.xml')
  const xml = await res.text()
  if (res.status !== 200 || !xml.includes('<urlset')) fail('/sitemap.xml', `status ${res.status} or not a sitemap`)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  for (const path of FIXED) {
    if (!locs.includes(CANONICAL_ORIGIN + (path === '/' ? '/' : path)) && !locs.includes(CANONICAL_ORIGIN + path)) fail('/sitemap.xml', `missing ${path}`)
  }
  for (const path of NOINDEX) if (locs.some((l) => l.endsWith(path))) fail('/sitemap.xml', `lists the noindex page ${path}`)
  if (locs.some((l) => /\/admin|\/api\//.test(l))) fail('/sitemap.xml', 'lists an admin or api address')
  // Every listed address that is not a fixed page must really exist and be indexable.
  const dynamic = locs.map((l) => l.replace(CANONICAL_ORIGIN, '')).filter((p) => p && p !== '/' && !FIXED.includes(p))
  for (const path of dynamic) await checkPage(path)
  console.log(`sitemap: ${locs.length} addresses (${dynamic.length} from the CMS)`)
}

// ── robots.txt ──────────────────────────────────────────────────────────────
{
  const txt = await (await get('/robots.txt')).text()
  if (!txt.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`)) fail('/robots.txt', 'does not point at the sitemap')
  if (!/Disallow: \/admin/.test(txt)) fail('/robots.txt', 'does not keep crawlers out of /admin')
  if (!/Allow: \/api\/media\//.test(txt)) fail('/robots.txt', 'uploaded images under /api/media are not crawlable')
  if (/Disallow: \/\s*$/m.test(txt)) fail('/robots.txt', 'blocks the whole site')
}

// ── llms.txt and the feed ───────────────────────────────────────────────────
{
  const res = await get('/llms.txt')
  const txt = await res.text()
  if (res.status !== 200 || !txt.startsWith('# Proxa Labs')) fail('/llms.txt', `status ${res.status} or unexpected content`)
  if (!(res.headers.get('content-type') || '').includes('text/plain')) fail('/llms.txt', 'not served as text/plain')
}
{
  const res = await get('/blog/rss.xml')
  const xml = await res.text()
  if (res.status !== 200 || !xml.includes('<rss')) fail('/blog/rss.xml', `status ${res.status} or not a feed`)
  if (!(res.headers.get('content-type') || '').includes('xml')) fail('/blog/rss.xml', 'not served as xml')
}

// ── security headers ────────────────────────────────────────────────────────
{
  const res = await get('/')
  for (const h of ['x-content-type-options', 'x-frame-options', 'referrer-policy', 'strict-transport-security']) {
    if (!res.headers.get(h)) fail('/', `missing ${h} header`)
  }
  if (res.headers.get('x-powered-by')) fail('/', 'x-powered-by header is exposed')
}

console.log(failures ? `\n${failures} problem(s) found` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
