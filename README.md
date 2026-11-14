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
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing a collection. |
| `npm run payload -- migrate:create <name>` | Create a migration after changing a collection or global. |

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

`node scripts/verify-site.mjs` checks all of this against a running server.

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
