# Solutions pages redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give AI Literacy, Advisory and Content Development each its own photo-led layout with about a third of the words.

**Architecture:** Each view (`src/views/LiteracyPage.jsx`, `AdvisoryPage.jsx`, `ContentPage.jsx`) gets bespoke markup; their styles live in one new file `src/views/SolutionsPages.css` (prefixes `lit-`, `adv-`, `cdev-`), imported by the three views. Copy stays CMS-editable through the page manifests; removed fields drop columns through a Payload migration.

**Tech Stack:** Next.js App Router, React, Payload CMS (Postgres), plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-21-solutions-pages-design.md`

## Global Constraints
- No dark or black section backgrounds; white, warm tint or brand orange only.
- Photos come from `src/content/images.js` via `<Photo>`; reuse existing files: literacy `team-data-briefing` (B&W hero), `trainer-with-charts` (tall, shadow); advisory `strategy-whiteboard` (B&W bleed), `advisor-conversation` (B&W beside list); content `colleagues-at-laptop` (unframed, faded) + screen `forge-workflow-desktop` (floating, big shadow).
- No stock face beside a named quote; the advisory quote stays anonymous.
- Every figure goes through `<CountUp>`.
- Each section fits a 1366 by 625 window under the 68px nav.
- Headings with an orange phrase keep the "rich default, plain override" pattern already in the views.

## Review Focus
- An editor overrides a heading in the CMS: plain string renders, no `<em>` lost markup errors.
- Phone width (390px): no horizontal scroll, photos stack under text.
- Reduced motion: marquee and reveal stop; figures show final values.
- Keyboard: advisory rows open with Enter/Space (native `<details>`), focus ring visible.
- Fields removed from a manifest: migration applies on an empty table; `npm run build` passes.

---

### Task 1: AI Literacy page
**Files:** Modify `src/views/LiteracyPage.jsx`, `src/content/pages/literacy.js`; Create `src/views/SolutionsPages.css` (lit- block)
- [ ] Centred hero (eyebrow, heading with orange phrase, ~17-word subhead, button), full-width grayscale `team-data-briefing` with a mask fade into white.
- [ ] Six role rows (tag, title, one line) with hairlines.
- [ ] Proof: tall `trainer-with-charts` with a large shadow beside heading, giant `+87%` and three small figures.
- [ ] Delivery strip (UMU.com · 5,000+ per cohort · 6 weeks · any LMS) and a closing line with button.
- [ ] Manifest keeps: hero.*, whyLiteracy.eyebrow/heading, tracks.eyebrow/heading, delivery.heading, cta.*; removes the rest. Shorter defaults.
- [ ] Verify: screenshot at 1440x900, 1366x625, 390x844.

### Task 2: Advisory page
**Files:** Modify `src/views/AdvisoryPage.jsx`, `src/content/pages/advisory.js`, CSS adv- block
- [ ] Split hero: grayscale `strategy-whiteboard` bleeding to the left edge, text on white right.
- [ ] Statement: giant `80–95%` count-up with one line.
- [ ] Engagements: sticky heading + grayscale `advisor-conversation` with shadow; six `<details>` rows (number, title, deliverable; one sentence open).
- [ ] Big quote, first sentence ink, rest grey; anonymous attribution. Closing line + button.
- [ ] Manifest removes why.pullQuote*, why.body2/3, engagements.lead; shorter defaults.
- [ ] Verify screenshots as above.

### Task 3: Content Development page
**Files:** Modify `src/views/ContentPage.jsx`, `src/content/pages/content.js`, CSS cdev- block
- [ ] Hero: text left; `colleagues-at-laptop` unframed with edge fade, `forge-workflow-desktop` floating over its lower left with a big shadow.
- [ ] Two-column comparison table (Best for / Speed / Built by) + shared standards row.
- [ ] Launch timeline: one line, three markers, outcome line, on white.
- [ ] Therapeutic areas as a large slow marquee (static under reduced motion). Closing line + button.
- [ ] Manifest: remove tracks.lead, scenario phase bodies kept short, therapeutic.lead removed.
- [ ] Verify screenshots as above.

### Task 4: Schema, cleanup, checks
- [ ] Remove now-unused CSS (`delivery-*`, `advisory-engagement*`, `content-track*`, `content-standards*`, `content-scenario*`, `therapeutic-*`) from `src/styles.css`.
- [ ] Stop dev server; `npm run payload -- migrate:create solutions_pages_redesign`; `npm run generate:types`.
- [ ] `npm run lint`, `npm test`, `npm run build`, `node scripts/verify-site.mjs`, hydration check on the three pages.
