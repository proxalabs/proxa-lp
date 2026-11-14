# Proxa Labs website

The Proxa Labs marketing site and its CMS, in one app:

- **Next.js 16** (App Router) renders every public page on the server.
- **Payload CMS 3** runs inside the same app: the admin is at `/admin`, the API at `/api`.
- **Postgres** stores the content. Uploaded media is kept on disk in `media/`.

> **Not deployed yet.** The live site is still the previous Vite + Firebase build.
> Do not merge this branch to `main` until hosting is set up: `.github/workflows/deploy.yml`
> still deploys `main` to Firebase Hosting and expects the old build.

## Run it locally

You need Node 22.23.4 or newer (`nvm use` reads `.nvmrc`) and Docker.

```bash
cp .env.example .env        # then set PAYLOAD_SECRET and PREVIEW_SECRET (openssl rand -hex 32)
npm install
npm run db:up               # Postgres 16 in Docker, on port 5433
npm run dev                 # http://localhost:3000
```

Open `http://localhost:3000/admin` and create the first account; it becomes the admin.

To fill a fresh database with the content from the live site:

```bash
npx payload run scripts/import-live-content.ts
```

That script only reads the live site's public endpoints. It is safe to run again.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server. Payload updates the database schema automatically. |
| `npm run lint` | ESLint. |
| `npm test` | Unit tests for the pure logic (routes, content getter, rich-text adapter, security helpers, structured data). |
| `npm run build` | Production build. Needs a migrated database (pages are prerendered from it). |
| `npm run ci` | `payload migrate && next build`: what a deploy pipeline should run. |
| `npm start` | Serve the production build. |
| `node scripts/verify-site.mjs [url]` | Crawl the running site the way a search engine does and check every SEO basic. |
| `node scripts/e2e-check.mjs [url]` | Against a production build: publish, edit, unpublish and trash content through the CMS API and check what visitors and crawlers then see. Creates and removes its own "E2E" content; not for a live site. |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing a collection. |
| `npm run payload -- migrate:create <name>` | Create a migration after changing a collection or global. |

`npm run ci` is for a database that only ever gets migrations. The development database has
its schema pushed automatically instead, so to try a production build locally, point
`DATABASE_URL` at a second, empty database first.

## How content works

**Fixed pages** (home, platform, advisory, …) keep their copy in code under `src/content/`.
Each one has a matching entry under *Site pages* in the admin where any field can be
overridden. An empty field means "use the built-in copy", which is shown as the placeholder.

**Everything else** lives in the CMS: blog posts, case studies, videos, landing pages built
from a kit of sections, forms, authors, media, the header menus and redirects.

**Publishing is immediate.** Pages are statically generated and cached. When something is
published, edited, unpublished or deleted, a hook refreshes exactly the pages it appears on,
plus the sitemap, `llms.txt` and the RSS feed. No rebuild is needed.

**Drafts, versions, scheduling and preview** are built in. Scheduled posts are published by a
job runner that starts with the server (`src/instrumentation.ts`).

**Roles.** Admins can do everything. Editors manage content but not users, site-page copy,
navigation, redirects or a landing page's custom code.

## SEO

- Every page is server-rendered with its title, description, canonical URL, Open Graph and
  Twitter tags (`src/lib/seo.ts`).
- Structured data is in the HTML: Organization, WebSite (with site search), BreadcrumbList,
  BlogPosting, FAQPage, VideoObject, Service and listing pages (`src/lib/jsonLd.js`).
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/blog/rss.xml` are generated from the CMS and
  leave out anything marked "hide from search engines".
- Unknown addresses return a real 404. Redirects from the CMS are permanent (308).
- All navigation is real `<a href>` links.
- Fonts are self-hosted (`public/fonts`, `src/fonts.css`). Uploaded images are resized to WebP.

`node scripts/verify-site.mjs` checks all of this against a running server, and CI runs it on every pull request together with `scripts/e2e-check.mjs`.

## Photographs and product screens

The marketing pages use real photographs and real screens of the apps. All of them are
listed, with their size and description, in `src/content/images.js`; the files are in
`public/assets/photos` and `public/assets/product`.

- **Photographs** are stock photos from Pexels (free for commercial use, no attribution
  required). Each entry records the page it came from. The people in them are models, so
  never place one beside a named quote or present it as a member of staff or a customer.
- **Product screens** are real screens of Forge, Cue, Stage and Trace, captured from local
  runs on throwaway data holding demo content only (made-up organisations, people and
  training text). The home page's product tour (`src/content/productTour.js`) lists which
  screen each product shows.
- **To add one:** `node scripts/optimize-image.mjs <source> public/assets/photos/<name> 1600 800`,
  then add an entry to `src/content/images.js` (a test checks the files exist).
- **To show one:** `<Photo name="…" />`, or one of the layouts in `src/components/media`
  (`HeroPhoto`, `PhotoBand`, `PhotoMosaic`, `ProductGlimpse`).

The floating effect is React Bits' TiltedCard, copied into `src/components/reactbits` with
its licence.

## Layout

```
src/app/(frontend)/   public routes and the root layout
src/app/(payload)/    Payload's admin and API (generated; do not edit)
src/payload.config.ts collections, globals, plugins, endpoints
src/collections/      posts, case studies, videos, landing pages, media, …
src/globals/          header menus, and one global per fixed page (generated from src/content)
src/endpoints/        /api/contact, /api/newsletter, /api/event-register, /api/submit-form
src/lib/data/         server-side data access (Payload's Local API)
src/lib/              routes, rich-text adapter, structured data, security helpers
src/views/            the page components
src/components/       shared components and the landing-page sections
src/migrations/       database migrations (used by production builds)
scripts/              content import, SEO check
```

## Before going live

- **Hosting.** Replace `.github/workflows/deploy.yml`. The server needs Node 22, a Postgres
  database and the variables in `.env.example`. Run `npm run ci` then `npm start`.
- **Media storage.** Uploads are written to local disk (`media/`, `files/`). On AWS, add
  Payload's S3 storage adapter so they survive a redeploy. Gated files are served through
  `/api/gated-file`, which reads from disk and will need the same change.
- **Email.** Set `SMTP_EMAIL` and `SMTP_PASSWORD`. Without them, notification emails are only
  written to the server log (submissions are still stored under *Leads* and *Form submissions*).
- **Content.** Run the import against the production database, then create the admin and
  editor accounts.
- **Firebase.** `functions/`, `firebase.json` and the Firestore rules are still in the repo
  for the live site. Remove them once the new site has replaced it.
