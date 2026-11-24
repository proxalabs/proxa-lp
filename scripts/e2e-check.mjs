// End-to-end check of a running PRODUCTION build (`npm run ci && npm start`),
// through plain HTTP only: it signs in to the CMS API, creates content the way an
// editor would, and checks what an anonymous visitor and a crawler then see.
//
//   node scripts/e2e-check.mjs [url]             # default http://localhost:3000
//
// On an empty database it registers the first account itself. Otherwise set
// E2E_EMAIL and E2E_PASSWORD to an admin account. Everything it creates is named
// "E2E …" and is deleted again at the end. Do not point it at a live site.

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '')
let failures = 0
const check = (ok, msg) => { console.log(ok ? 'ok  ' : 'FAIL', msg); if (!ok) failures++ }

const anon = (path, init) => fetch(base + path, { redirect: 'manual', cache: 'no-store', ...init })
const text = async (path) => (await anon(path)).text()
const status = async (path) => (await anon(path)).status
const rich = (words) => ({
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [
    { type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, children: [{ type: 'text', text: words, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] },
  ] },
})

// ── sign in ─────────────────────────────────────────────────────────────────
const email = process.env.E2E_EMAIL || 'e2e-admin@example.com'
const password = process.env.E2E_PASSWORD || 'E2E-check-Passw0rd!'
// The form endpoints allow 12 submissions per client address per 15 minutes, so
// each run presents its own address (possible here because nothing sits in front
// of the server; behind a proxy the proxy's own entry is the one that counts).
const clientAddress = `198.51.100.${1 + Math.floor(Math.random() * 250)}`
const post = (path, body) =>
  anon(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': clientAddress }, body: JSON.stringify(body) })
let registered = false
let auth = await (await post('/api/users/login', { email, password })).json()
if (!auth.token) {
  auth = await (await post('/api/users/first-register', { email, password, name: 'E2E Admin' })).json()
  registered = Boolean(auth.token)
}
if (!auth.token) {
  console.log('Could not sign in. Set E2E_EMAIL and E2E_PASSWORD to an admin account.')
  process.exit(1)
}
const headers = { 'content-type': 'application/json', Authorization: `JWT ${auth.token}` }
const api = async (method, path, body) => {
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  return { status: r.status, json: await r.json().catch(() => ({})) }
}
const made = [] // [collection, id], deleted in reverse at the end
const create = async (collection, body, query = '') => {
  const r = await api('POST', `/api/${collection}${query}`, body)
  if (r.json.doc?.id) made.push([collection, r.json.doc.id])
  return r
}

try {
  check(auth.user?.role === 'admin', 'signed in as an admin')

  // ── publishing is immediate, everywhere ────────────────────────────────────
  const fresh = await create('posts', { title: 'E2E Fresh Post', _status: 'published', content: rich('e2e-fresh-body') })
  const freshId = fresh.json.doc?.id
  check(fresh.status === 201, 'published a post through the API')
  check((await text('/blog')).includes('E2E Fresh Post'), 'the cached blog index shows it immediately')
  const page = await anon('/blog/e2e-fresh-post')
  check(page.status === 200 && (await page.text()).includes('e2e-fresh-body'), 'its page is live, with the body in the html')
  check((await text('/sitemap.xml')).includes('/blog/e2e-fresh-post</loc>'), 'the sitemap lists it')
  check((await text('/blog/rss.xml')).includes('E2E Fresh Post'), 'the feed lists it')
  check((await text('/llms.txt')).includes('E2E Fresh Post'), 'llms.txt lists it')
  check((await text('/search?q=E2E%20Fresh')).includes('/blog/e2e-fresh-post'), 'site search finds it')

  // ── unpublishing while a newer draft exists ────────────────────────────────
  // An editor types (autosave stores a draft on top of the live post), then unpublishes.
  await api('PATCH', `/api/posts/${freshId}?draft=true&autosave=true`, { title: 'E2E Fresh Post edited', _status: 'draft' })
  check((await text('/blog')).includes('E2E Fresh Post') && !(await text('/blog')).includes('E2E Fresh Post edited'), 'an autosaved draft does not change the live page')
  await api('PATCH', `/api/posts/${freshId}`, { _status: 'draft' })
  check(!(await text('/blog')).includes('E2E Fresh Post'), 'unpublishing (with a pending draft) removes it from the blog immediately')
  check((await status('/blog/e2e-fresh-post')) === 404, 'and its page becomes a 404')
  check(!(await text('/sitemap.xml')).includes('e2e-fresh-post'), 'and it leaves the sitemap')
  check(!(await text('/blog/rss.xml')).includes('E2E Fresh Post'), 'and the feed')

  // ── changing a published address ───────────────────────────────────────────
  const moved = await create('posts', { title: 'E2E Moving Post', slug: 'e2e-old-address', _status: 'published', content: rich('e2e-moving-body') })
  check((await status('/blog/e2e-old-address')) === 200, 'a post is live at its first address')
  await api('PATCH', `/api/posts/${moved.json.doc?.id}`, { slug: 'e2e-new-address', _status: 'published' })
  check((await status('/blog/e2e-new-address')) === 200, 'after a slug change the new address is live')
  check((await status('/blog/e2e-old-address')) === 404, 'and the old address stops answering immediately')

  // ── an author edit reaches the articles that show the author ───────────────
  const author = await create('authors', { name: 'E2E Author', title: 'Tester', bio: 'e2e-bio-one' })
  await create('posts', { title: 'E2E Authored Post', _status: 'published', author: author.json.doc?.id, content: rich('e2e-authored-body') })
  check((await text('/blog/e2e-authored-post')).includes('e2e-bio-one'), 'an article shows its author bio')
  await api('PATCH', `/api/authors/${author.json.doc?.id}`, { bio: 'e2e-bio-two' })
  check((await text('/blog/e2e-authored-post')).includes('e2e-bio-two'), 'editing the author updates the article immediately')

  // ── drafts and trashed documents are invisible to the public ───────────────
  await create('posts', { title: 'E2E Secret Draft', _status: 'draft', content: rich('e2e-secret-body') }, '?draft=true')
  check((await status('/blog/e2e-secret-draft')) === 404, 'a draft has no public page')
  for (const [name, path] of [['blog index', '/blog'], ['sitemap', '/sitemap.xml'], ['feed', '/blog/rss.xml'], ['llms.txt', '/llms.txt'], ['search', '/search?q=E2E%20Secret']]) {
    check(!/E2E Secret Draft|e2e-secret-draft/.test(await text(path)), `a draft is not in the ${name}`)
  }
  for (const query of ['', '&draft=true', '&where[_status][equals]=draft']) {
    const r = await (await anon(`/api/posts?where[slug][equals]=e2e-secret-draft${query}`)).json()
    check((r.totalDocs ?? 0) === 0, `a draft is not readable through the public API (${query || 'plain'})`)
  }

  const trashed = await create('posts', { title: 'E2E Trashed Post', _status: 'published', content: rich('e2e-trashed-body') })
  check((await status('/blog/e2e-trashed-post')) === 200, 'a post is live before it is trashed')
  await api('PATCH', `/api/posts/${trashed.json.doc?.id}`, { deletedAt: new Date().toISOString() })
  check((await status('/blog/e2e-trashed-post')) === 404, 'moving a post to the trash takes its page down immediately')
  check(!(await text('/blog')).includes('E2E Trashed Post'), 'and removes it from the blog')
  for (const query of ['', '&trash=true']) {
    const r = await (await anon(`/api/posts?where[slug][equals]=e2e-trashed-post${query}`)).json()
    check((r.totalDocs ?? 0) === 0, `a trashed post is not readable through the public API (${query || 'plain'})`)
  }

  // ── the editor's create flow ───────────────────────────────────────────────
  const blank1 = await create('posts', {}, '?draft=true')
  const blank2 = await create('posts', {}, '?draft=true')
  check(blank1.status === 201 && blank2.status === 201, 'two untitled drafts can exist at once (opening "Create new" twice)')
  // The address follows the title while an editor is still typing it (autosave),
  // instead of freezing at the first few letters.
  const typing = blank1.json.doc?.id
  await api('PATCH', `/api/posts/${typing}?draft=true&autosave=true`, { title: 'E2E Ty', _status: 'draft' })
  await api('PATCH', `/api/posts/${typing}?draft=true&autosave=true`, { title: 'E2E Typed Title', _status: 'draft' })
  const typed = await api('GET', `/api/posts/${typing}?draft=true&depth=0`)
  check(typed.json.slug === 'e2e-typed-title', `a draft's address follows its title as it is typed (got "${typed.json.slug}")`)
  const reserved = await create('pages', { title: 'E2E Blog Clash', slug: 'blog', _status: 'published' })
  check(reserved.status === 400, 'a landing page cannot take a reserved address')

  // ── fixed-page copy and redirects ──────────────────────────────────────────
  const g = await api('POST', '/api/globals/page-about', { hero_eyebrow: 'E2E ABOUT EYEBROW' })
  check(g.status === 200 && (await text('/about')).includes('E2E ABOUT EYEBROW'), 'a copy override on a fixed page shows immediately')
  await api('POST', '/api/globals/page-about', { hero_eyebrow: '' })
  check(!(await text('/about')).includes('E2E ABOUT EYEBROW'), 'clearing it restores the built-in copy immediately')

  check((await status('/e2e-moved-here')) === 404, 'an unknown address is a 404')
  const rule = await create('redirects', { from: '/e2e-moved-here', to: { type: 'custom', url: '/contact' } })
  const hop = await anon('/e2e-moved-here')
  check(rule.status === 201 && hop.status === 308 && (hop.headers.get('location') || '').endsWith('/contact'), 'a new redirect replaces the cached 404 with a permanent redirect')

  // ── forms ──────────────────────────────────────────────────────────────────
  const form = await create('forms', {
    title: 'E2E Form', slug: 'e2e-form', _status: 'published', consentText: 'I agree.', notifyEmail: 'e2e-secret-notify@example.com',
    confirmationType: 'message', confirmationMessage: rich('Thanks.'),
    emails: [{ emailTo: 'e2e-secret-autoresponder@example.com', subject: 'Hello', message: rich('Hi') }],
    fields: [{ blockType: 'text', name: 'fullName', label: 'Full name', required: true }, { blockType: 'email', name: 'email', label: 'Email', required: true }],
  })
  check(form.status === 201, 'created a form')
  const publicForm = await text('/api/forms?where[slug][equals]=e2e-form')
  check(publicForm.includes('E2E Form') && !publicForm.includes('e2e-secret-'), 'the public form definition reveals no email address')
  check((await text('/forms/e2e-form')).includes('Full name'), 'the form has its own page')
  const submit = (body) => post('/api/submit-form', { formSlug: 'e2e-form', ...body })
  check((await submit({ data: { fullName: 'A', email: 'a@example.com' } })).status === 400, 'a form needs its consent box ticked')
  check((await submit({ data: { email: 'a@example.com' }, consent: true })).status === 400, 'a form enforces its required fields')
  check((await submit({ data: { fullName: 'E2E Person', email: 'a@example.com' }, consent: true })).status === 200, 'a valid submission is accepted')
  check((await submit({ data: { fullName: 'Bot', email: 'b@example.com' }, consent: true, _hp: 'x' })).status === 200, 'the honeypot pretends success')
  const subs = await api('GET', `/api/form-submissions?where[form][equals]=${form.json.doc?.id}&depth=0`)
  check(subs.json.totalDocs === 1, 'exactly the one real submission was stored')
  for (const s of subs.json.docs || []) made.push(['form-submissions', s.id])
  check((await post('/api/form-submissions', { form: form.json.doc?.id, submissionData: [] })).status === 403, 'submissions cannot be written directly')

  // ── a landing page built from every kind of section ────────────────────────
  const landing = await create('pages', {
    title: 'E2E Landing', slug: 'e2e-landing', _status: 'published',
    layout: [
      { blockType: 'hero', headline: 'E2E hero headline', subhead: 'E2E hero subhead', ctaLabel: 'E2E hero button', ctaPage: 'contact' },
      { blockType: 'split', heading: 'E2E split heading', body: 'E2E split body' },
      { blockType: 'richText', heading: 'E2E rich heading', body: rich('E2E rich body') },
      { blockType: 'cards', heading: 'E2E cards heading', cards: [{ title: 'E2E card title', body: 'E2E card body' }] },
      { blockType: 'stats', stats: [{ value: '87%', label: 'E2E stat label', source: 'E2E stat source' }] },
      { blockType: 'quote', quote: 'E2E quote text', author: 'E2E quote author' },
      { blockType: 'cta', heading: 'E2E cta heading', ctaLabel: 'E2E cta button', ctaPage: 'platform' },
      { blockType: 'faq', heading: 'E2E faq heading', items: [{ question: 'E2E question?', answer: 'E2E answer.' }] },
      { blockType: 'logoStrip', heading: 'E2E logos heading', logos: [] },
      { blockType: 'form', heading: 'E2E form heading', form: form.json.doc?.id },
    ],
  })
  check(landing.status === 201, 'built a landing page with all ten section types')
  const landingHtml = await text('/e2e-landing')
  for (const piece of ['E2E hero headline', 'E2E split heading', 'E2E rich body', 'E2E card title', 'E2E stat label', 'E2E quote text', 'E2E cta heading', 'E2E question?', 'E2E logos heading', 'E2E form heading', 'Full name']) {
    check(landingHtml.includes(piece), `the landing page renders "${piece}"`)
  }
  check(/<a[^>]+href="\/contact"[^>]*>E2E hero button/.test(landingHtml) && /<a[^>]+href="\/platform"[^>]*>E2E cta button/.test(landingHtml), 'its buttons are real links')
  check((landingHtml.match(/<h1[\s>]/g) || []).length === 1 && landingHtml.includes('"@type":"FAQPage"'), 'it has one h1 and FAQ structured data')
  check((await text('/sitemap.xml')).includes('/e2e-landing</loc>'), 'and it is in the sitemap')

  // A landing page linked from the header menu: renaming it must update the menu
  // on every page, including the fixed pages that were cached before the rename.
  const navBefore = await api('GET', '/api/globals/navigation?depth=0')
  const keep = (rows) => (rows || []).map(({ label, linkPage, linkBuiltPage }) => ({ label, linkPage, linkBuiltPage }))
  try {
    await api('POST', '/api/globals/navigation', { resources: [{ label: 'E2E Menu Link', linkPage: '_built', linkBuiltPage: landing.json.doc?.id }] })
    check((await text('/about')).includes('href="/e2e-landing"'), 'a landing page added to the header menu is linked from a fixed page')
    await api('PATCH', `/api/pages/${landing.json.doc?.id}`, { slug: 'e2e-landing-renamed', _status: 'published' })
    const aboutAfter = await text('/about')
    check(aboutAfter.includes('href="/e2e-landing-renamed"') && !aboutAfter.includes('href="/e2e-landing"'), 'renaming it updates the menu on fixed pages immediately')
  } finally {
    await api('POST', '/api/globals/navigation', { resources: keep(navBefore.json.resources) })
  }

  // ── contact endpoint ───────────────────────────────────────────────────────
  check((await post('/api/contact', { name: '', email: 'nope' })).status === 400, 'contact rejects a missing name or bad email')
  check((await post('/api/contact', { name: 'E2E Contact', email: 'e2e-contact@b.co', message: 'Hello' })).status === 200, 'contact accepts a valid inquiry')
  check((await post('/api/contact', { name: 'E2E Bot', email: 'e2e-bot@example.com', _hp: 'x' })).status === 200, 'contact honeypot pretends success')
  const leads = await api('GET', '/api/leads?where[name][like]=E2E&depth=0')
  check(leads.json.totalDocs === 1, 'exactly the one real inquiry was stored as a lead')
  for (const l of leads.json.docs || []) made.push(['leads', l.id])
  check((await status('/api/leads')) === 403, 'leads are not readable by the public')
} finally {
  for (const [collection, id] of made.reverse()) await api('DELETE', `/api/${collection}/${id}?trash=true`).catch(() => {})
  if (registered) await api('DELETE', `/api/users/${auth.user?.id}`)
}

console.log(failures ? `\n${failures} problem(s) found` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
