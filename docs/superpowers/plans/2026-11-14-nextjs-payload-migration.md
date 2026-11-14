# Next.js + Payload CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite SPA and custom Firebase CMS with one Next.js app that embeds Payload CMS on Postgres, keeping design and URLs and making every page server-rendered and strong for search.

**Architecture:** Next.js App Router with two route groups: `(frontend)` for the public site and `(payload)` for Payload's admin and REST API. Server components read Payload's Local API; small adapters turn Payload documents into the shapes the existing React components already accept. Pages are statically generated and revalidated on demand by Payload hooks.

**Tech Stack:** Next.js 16.4, React 19, Payload 3.93 (`db-postgres`, `richtext-lexical`, plugins: seo, redirects, form-builder, search), Postgres 16, TypeScript for new code, existing components stay `.jsx`, `node --test` for pure logic.

**Spec:** `docs/superpowers/specs/2026-11-14-nextjs-payload-migration-design.md`

## Global Constraints

- All commits on branch `cleanup-root-files`. No new branch. Never push to `main`.
- Nothing is deployed. Do not touch the Firebase project or AWS.
- Do not modify: `functions/`, `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `scripts/seed.mjs`, `scripts/seed-emulator.cjs`, `scripts/sync-redirects.mjs`, `.github/workflows/deploy.yml`.
- Same design, same URLs. No copy changes.
- Admin lives at `/admin`.
- Local Postgres runs in Docker on port **5433**. Never use the `proxa-forge` database on 5432.
- Reference only (never import from): `<scratchpad>/payload-ref/templates/website` — Payload's official template at v3.93.0.
- Never print or commit `.env`.
- Reserved CMS page slugs (cannot be used for a built page): every fixed route's first segment, plus `admin`, `api`, `next`, `media`, `assets`, `blog`, `news`, `case-studies`, `videos`, `forms`, `search`, `sitemap.xml`, `robots.txt`, `llms.txt`.

## Review Focus

1. **A whitespace-only CMS override** must fall back to the in-code default, not render blank. → Task 2 test.
2. **A manifest key that maps to a duplicate or over-long Postgres column** must fail at test time, not at schema push. → Task 2 test over all 362 keys.
3. **A draft or scheduled document** must never be readable by an anonymous visitor (page, sitemap, feed, search, llms.txt). → Task 11 crawl check.
4. **A built page saved with a reserved slug** (`blog`, `admin`, `platform`) must be rejected. → Task 4 test of the slug validator.
5. **Rich text or copy containing `</script>` or event handlers** must not break out of JSON-LD or run as script. → Task 5 tests of `jsonLdString` and `lexicalToBody`.

---

## File Structure

```
docker-compose.yml               Postgres 16 on 5433
next.config.mjs                  withPayload, redirects, headers, images
tsconfig.json  eslint.config.js  .nvmrc  .env.example
src/payload.config.ts
src/payload-types.ts             generated
src/migrations/                  generated
src/access/index.ts              anyone, isStaff, isAdmin, publishedOrStaff
src/fields/slug.ts  seo.ts       shared field builders
src/collections/                 Users Media Files Authors Categories Posts CaseStudies Videos Pages Leads ActivityLog RateLimits
src/blocks/                      page-layout blocks + article blocks
src/globals/Navigation.ts  sitePages.ts   (14 globals generated from the manifest)
src/hooks/revalidate.ts  activityLog.ts
src/endpoints/                   contact newsletter eventRegister submitForm gatedFile + shared.ts
src/plugins.ts
src/app/(payload)/…              copied from the template
src/app/(frontend)/…             layout, routes, sitemap.ts, robots.ts, llms.txt, rss, not-found
src/views/                       was src/pages
src/components/                  existing; + JsonLd.jsx, Analytics.jsx, LivePreviewListener.tsx
src/lib/routes.js                page key ↔ URL            (pure, tested)
src/lib/pageContent.js           field naming + c(key)      (pure, tested)
src/lib/lexical.js               Lexical ↔ article body     (pure, tested)
src/lib/security.js              signed tokens, rate window, escaping (pure, tested)
src/lib/pageMeta.js              default titles/descriptions/noindex per page
src/lib/seo.ts                   buildMetadata()
src/lib/jsonLd.js                schema.org builders (DOM code removed)
src/lib/data/*.ts                server-only data layer on the Local API
scripts/import-live-content.ts   one-off import
scripts/verify-site.mjs          route/SEO crawl check
```

Deleted: `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/admin/`, `src/sentry.js`, `src/lib/{firebase,firebaseAuth,adminBlog,blog,caseStudies,videos,forms,customContent,search,pages,content,fetchCache,site}.js`, `src/views/{GenericDetailPage,CmsFormPage,DynamicPage}.jsx` (replaced by routes), `src/components/ContentTypeList.jsx`, `scripts/prerender.mjs`, `scripts/a11y-audit.mjs`, `public/robots.txt`.

---

### Task 1: Scaffold Next.js + Payload + Postgres

**Files:** Create `docker-compose.yml`, `next.config.mjs`, `tsconfig.json`, `.nvmrc`, `src/payload.config.ts`, `src/collections/Users.ts`, `src/access/index.ts`, `src/app/(payload)/**`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/page.tsx`. Modify `package.json`, `eslint.config.js`, `.gitignore`, `.env.example`. Delete the Vite files.

**Interfaces — Produces:**
- npm scripts: `dev`, `build` (`next build`), `start`, `lint`, `test` (`node --test "src/**/*.test.js"`), `payload`, `generate:types`, `generate:importmap`, `db:up` (`docker compose up -d db`), `ci` (`payload migrate && next build`).
- Env: `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- `src/access/index.ts`: `anyone`, `isStaff`, `isAdmin`, `isAdminField`, `publishedOrStaff` (returns `{ _status: { equals: 'published' } }` for anonymous requests).
- `users`: `auth` with `maxLoginAttempts: 8`, `lockTime: 15 min`; fields `name`, `role` (`admin` | `editor`, default `editor`); the first user created is forced to `admin`.

- [ ] Install Node ≥ 22.23.4 through nvm; write `.nvmrc`.
- [ ] Rename `src/pages` → `src/views` (`git mv`) before installing Next.
- [ ] Remove Vite deps; add next, payload packages, typescript, sharp, graphql, `eslint-config-next`.
- [ ] `docker-compose.yml`: service `db`, image `postgres:16`, port `5433:5432`, database `proxa_site`, named volume.
- [ ] Copy the `(payload)` files from the template; placeholder frontend layout + page.
- [ ] Verify: `npm run db:up && npm run dev`, then `curl -s -o /dev/null -w '%{http_code}' localhost:3000/admin` → `200`, and `/` → `200`.
- [ ] Commit.

### Task 2: Pure helpers — routes and page content

**Files:** Create `src/lib/routes.js`, `src/lib/routes.test.js`, `src/lib/pageContent.js`, `src/lib/pageContent.test.js`, `src/lib/pageMeta.js`.

**Interfaces — Produces:**
- `PAGE_PATHS: Record<pageKey, path>` (moved from `App.jsx`, minus `admin`).
- `hrefFor(page: string, opts?: string | {hash?: string, slug?: string}): string`
- `pageKeyForPath(pathname: string): string | null`
- `RESERVED_SLUGS: Set<string>`
- `fieldName(key: string): string` — `'hero.ctaLabel'` → `'hero_ctaLabel'`
- `makeGetter(defaults: Record<string,string>, overrides?: Record<string,string>): (key) => string`
- `PAGE_TITLES`, `PAGE_DESCRIPTIONS`, `NOINDEX_PAGES` in `pageMeta.js` (moved from `App.jsx`).

- [ ] Write failing tests:

```js
test('hrefFor maps keys, hashes and slugs', () => {
  assert.equal(hrefFor('home'), '/')
  assert.equal(hrefFor('literacy'), '/ai-literacy')
  assert.equal(hrefFor('resources', 'frameworks'), '/resources#frameworks')
  assert.equal(hrefFor('resources', { hash: '#research' }), '/resources#research')
  assert.equal(hrefFor('article', { slug: 'the-readiness-gap' }), '/blog/the-readiness-gap')
  assert.equal(hrefFor('caseStudy', { slug: 'x' }), '/case-studies/x')
  assert.equal(hrefFor('form', { slug: 'x' }), '/forms/x')
  assert.equal(hrefFor('ai-readiness-day'), '/ai-readiness-day')   // CMS-built page
})
test('pageKeyForPath', () => {
  assert.equal(pageKeyForPath('/the-lab/'), 'proxalab')
  assert.equal(pageKeyForPath('/blog/some-post'), 'blog')
  assert.equal(pageKeyForPath('/nope'), null)
})
test('override wins, blank falls back', () => {
  const c = makeGetter({ a: 'A', b: 'B' }, { a: 'X', b: '   ' })
  assert.equal(c('a'), 'X'); assert.equal(c('b'), 'B'); assert.equal(c('zzz'), undefined)
})
test('every manifest key maps to a unique column-safe field name', () => {
  // for each page: names unique; /^[a-zA-Z][a-zA-Z0-9_]*$/; snake-cased length ≤ 50
})
```

- [ ] Run `npm test` → fails. Implement. Run → passes. Commit.

### Task 3: Frontend shell and fixed pages on in-code defaults

**Files:** Modify every file in `src/views/` and `src/components/` that uses `setPage`, `usePageContent`, `useNavMenus`, `window.location` routing or `import.meta.env`. Create `src/app/(frontend)/layout.tsx`, one `page.tsx` per fixed route, `src/components/Analytics.jsx`, `src/components/JsonLd.jsx`, `src/lib/seo.ts`. Modify `src/styles.css`, `src/lib/jsonLd.js`, `src/analytics.js`.

**Interfaces — Consumes:** `hrefFor`, `pageKeyForPath`, `makeGetter`, `pageMeta`.
**Produces:**
- Every view: `export default function XPage({ content })`, with `const c = makeGetter(defaultsFor('<id>'), content)`.
- Section components accept `primaryCta={{ label, href }}` / `secondaryCta` and render `<Link>`; `QuietLink` takes `href`.
- `Nav({ menus })` and `Footer()` render `<Link>`; Nav reads the active page from `usePathname()`. Dropdown and accordion bodies are always in the DOM, hidden with the `hidden` attribute when closed.
- `buildMetadata({ title, description, path, image?, noindex?, type? }): Metadata` — sets canonical, Open Graph, Twitter, robots.
- `<JsonLd data={object} />` renders one `<script type="application/ld+json">` with `<` escaped.
- Fonts: `next/font/google` Manrope + DM Sans exposed as `--font-manrope` / `--font-dm-sans`; every `'Manrope'` / `'DM Sans'` font-family in CSS and inline styles switches to the variable; the Google Fonts `@import` is removed.

- [ ] Convert Nav, Footer, the section components and `HomePage` first; confirm `/` renders.
- [ ] Convert the remaining views. `'use client'` only on files that keep hooks or event handlers.
- [ ] Add the 14 fixed routes with `generateMetadata` from `pageMeta`.
- [ ] Add next.config redirects: `/proxa-labs` → `/the-lab`, `/letsmeet` → `/contact` (permanent).
- [ ] Verify: each fixed route returns 200 with one `<h1>`, a canonical and nav/footer `<a href>` links in raw HTML; `git grep -n "setPage\|import.meta.env" -- src` is empty.
- [ ] Commit.

### Task 4: Payload content model

**Files:** Create everything under `src/collections/`, `src/blocks/`, `src/globals/`, `src/fields/`, `src/hooks/`, `src/plugins.ts`; modify `src/payload.config.ts`. Test: `src/fields/slug.test.js`.

**Interfaces — Produces** (collection slugs are the contract):
- `media` (public read; `alt` required; sizes `thumbnail` 400w, `card` 800w, `hero` 1600w, `og` 1200×630), `files` (staff-only read), `authors`, `categories`, `posts`, `case-studies`, `videos`, `pages`, `leads`, `activity-log`, `rate-limits`; plugin collections `forms`, `form-submissions`, `redirects`, `search`.
- `posts`, `case-studies`, `videos`, `pages`: `versions: { drafts: { autosave, schedulePublish: true }, maxPerDoc: 30 }`, `slug` unique, SEO tab (`meta.title`, `meta.description`, `meta.image`, `canonical`, `noindex`).
- `posts` fields: `title`, `slug`, `category`, `tags`, `featured`, `order`, `publishedDate`, `readTime`, `author`, `hideAuthor`, `summary`, `hideSummary`, `heroImage`, `cardImage`, `showHero`, `content` (Lexical: h2–h4, bold, italic, underline, link, lists, quote, upload, blocks `takeaways` and `faq`), `related`.
- `pages.layout` block slugs: `hero`, `split`, `richText`, `cards`, `stats`, `quote`, `cta`, `faq`, `logoStrip`, `form`; plus `structuredType` and admin-only `customCode`.
- Globals: `navigation` (`platform`, `solutions`, `resources` arrays of `{ label, page }`), and `page-<id>` for `home platform advisory literacy insitex content proxalab about news resources newsletter contact futureproof innovation`, fields generated with `fieldName()` plus `seo.{title,description,image,noindex}`. Admin-only write.
- `validateSlug(value): true | string` in `src/fields/slugRules.js` rejects reserved slugs and anything not matching `/^[a-z0-9][a-z0-9-]*$/`.
- `revalidateCollection(pathsFor: (doc) => string[])`, `revalidateGlobal(paths: string[])` — both skip when `req.context.disableRevalidate`.
- `activity-log` rows `{ action: 'create'|'update'|'delete', collection, docId, title, user, role }`; create via hooks only, admin read, no update or delete.

- [ ] Failing test for `validateSlug` (`'blog'`, `'admin'`, `'platform'`, `'Bad Slug'` rejected; `'ai-readiness-day'` accepted). Implement. Pass.
- [ ] Build collections, blocks, globals, plugins. `npm run generate:types` and `generate:importmap` succeed.
- [ ] Verify in `/admin`: create the first user, every collection and global opens, a post saves as draft and publishes.
- [ ] Commit.

### Task 5: Adapters and data layer

**Files:** Create `src/lib/lexical.js`, `src/lib/lexical.test.js`, `src/lib/security.js`, `src/lib/security.test.js`, `src/lib/data/{payload,sitePages,posts,caseStudies,videos,pages,forms,search,redirects}.ts`.

**Interfaces — Produces:**
- `lexicalToBody(state): { body: Block[], toc: {id,label}[] }` — blocks `{type:'h2',level,id,text}`, `{type:'p',html}`, `{type:'html',html}` (lists), `{type:'quote',text}`, `{type:'image',src,alt,caption}`, `{type:'takeaways',items}`, `{type:'faq',items:[{q,a}]}`. TOC is the h2s. Heading ids are slugified and de-duplicated.
- `lexicalToHtml(state): string`, `lexicalToText(state): string`, `bodyToLexical(body): state` (for the import).
- `jsonLdString(obj): string` escapes `<`.
- `getPageData(pageId): Promise<{ content: Record<string,string>, seo: {title?,description?,image?,noindex?} }>`
- `getNavMenus()`, `getPosts()`, `getPost(slug)`, `getCaseStudies()`, `getCaseStudy(slug)`, `getVideos()`, `getCmsPage(slug)`, `getPublicForm(slug)`, `searchSite(q)`, `findRedirect(path)`. All honour Next draft mode and use `overrideAccess: false` otherwise. Posts come back in the article shape `ArticleLayout` already takes.

- [ ] Failing tests:

```js
test('paragraph formatting and links become safe html', () => { /* bold+italic text node, link node → '<strong><em>…</em></strong>', '<a href="…">' ; text '<script>' is escaped */ })
test('headings build the toc with unique ids', () => { /* two h2 "Overview" → ids 'overview', 'overview-2' */ })
test('takeaways and faq blocks map through', () => {})
test('bodyToLexical round-trips', () => { /* lexicalToBody(bodyToLexical(body)).body deep-equals body */ })
test('jsonLdString escapes </script>', () => { assert.ok(!jsonLdString({ a: '</script>' }).includes('</script>')) })
```

- [ ] Implement; pass. Wire the fixed-page routes to `getPageData`. Commit.

### Task 6: Dynamic routes

**Files:** Create routes `blog/page.tsx`, `blog/[slug]/page.tsx`, `news/page.tsx`, `case-studies/page.tsx`, `case-studies/[slug]/page.tsx`, `videos/page.tsx`, `forms/[slug]/page.tsx`, `search/page.tsx`, `[...slug]/page.tsx`, `not-found.tsx`. Modify the matching views to take data as props.

**Interfaces — Consumes:** Task 5 data layer. **Produces:** every dynamic route exports `generateMetadata`; slug routes export `generateStaticParams` and `revalidate = 600`; a missing document checks `findRedirect(path)` (permanent redirect) and otherwise calls `notFound()`.

- [ ] Verify: an unknown URL returns **404** with the site chrome; a redirect row returns **308**; a published post renders its body in raw HTML.
- [ ] Commit.

### Task 7: Server endpoints

**Files:** Create `src/endpoints/{shared,contact,newsletter,eventRegister,submitForm,gatedFile}.ts`; modify `src/payload.config.ts` (`endpoints`, `email`), the form views (env names), `src/lib/security.js` + test.

**Interfaces — Produces:**
- `POST /api/contact | /api/newsletter | /api/event-register | /api/submit-form`, `GET /api/gated-file?token=`. Request and response bodies identical to the Cloud Functions they replace.
- `signToken(payload, secret, ttlMs, now)`, `verifyToken(token, secret, now): payload | null`
- `nextWindow(state, now, windowMs): {count, first}` — limits 12 per IP and 300 global per 15 minutes.
- `escapeHtml(v)`, `singleLine(v)`.

- [ ] Failing tests: token round-trip, expired token → `null`, tampered token → `null`; window resets after 15 minutes; `escapeHtml` on `<img onerror=…>`.
- [ ] Implement; pass. Verify each endpoint with curl: valid → `200 {"success":true}`, invalid → `400`, honeypot → `200` and nothing stored.
- [ ] Commit.

### Task 8: SEO surface

**Files:** Create `src/app/(frontend)/sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `blog/rss.xml/route.ts`; modify `src/lib/jsonLd.js`, route files, `next.config.mjs` (security headers, image config), image-bearing components.

**Interfaces — Produces:** JSON-LD builders `buildOrgLd`, `buildWebSiteLd` (with `SearchAction`), `buildBreadcrumbLd`, `buildArticleLd` (BlogPosting with `dateModified`, publisher logo), `buildFaqLd`, `buildVideoLd`, `buildServiceLd`, `buildCollectionLd`.

- [ ] Sitemap lists fixed indexable routes plus published posts, case studies and pages with `lastModified`, excluding `noindex`.
- [ ] `robots.ts` disallows `/admin`, `/api`, `/next`; points at the sitemap.
- [ ] Hooks revalidate sitemap, feed and llms.txt on publish.
- [ ] Commit.

### Task 9: Preview and scheduled publishing

**Files:** Create `src/app/(frontend)/next/preview/route.ts`, `next/exit-preview/route.ts`, `src/components/LivePreviewListener.tsx`; modify collections (`admin.livePreview`, `admin.preview`) and `payload.config.ts` (`jobs.autoRun`).

- [ ] Verify: a draft opens in the admin's live preview; a post scheduled a minute ahead publishes itself.
- [ ] Commit.

### Task 10: Import live content

**Files:** Create `scripts/import-live-content.ts`.

- [ ] Read published `articles`, `caseStudies`, `videos` through the public Firestore REST query and `/api/content` from `https://insite-hub-web.web.app`. Read only.
- [ ] Create authors, media (downloaded images), categories, posts (`bodyToLexical`), and the Innovation Collective global. Idempotent by slug. Runs with `context.disableRevalidate`.
- [ ] Verify: `/blog` lists four posts; each post's text matches the live page.
- [ ] Commit.

### Task 11: Migrations, CI, docs, verification

**Files:** Create `src/migrations/*`, `scripts/verify-site.mjs`; modify `.github/workflows/ci.yml`, `README.md`, `CLAUDE.md` (Project Notes and Start command only), `.env.example`.

- [ ] `npm run payload migrate:create` and commit the migration.
- [ ] CI: Postgres service container, `npm run ci`, `npm test`, `npm run lint`.
- [ ] `verify-site.mjs` fetches every route without JavaScript and asserts status, one `<h1>`, canonical, parseable JSON-LD, and that a draft post is absent from the page, sitemap, feed, search and llms.txt.
- [ ] Screenshot each page at 1440 and 390 wide against the live site.
- [ ] `npm run lint && npm test && npm run ci` pass against a clean database.
- [ ] Commit.
