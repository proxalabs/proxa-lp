# Solutions pages redesign (AI Literacy, Advisory, Content Development)

Approved by the site owner on 2026-11-21 ("go ahead").

## Why
The three Solutions pages look alike (same EditorialHero: headline left, framed photo with
chip right, then long text) and carry too many words. The owner wants each page designed
differently around its own message, with photos of people integrated with the type: not
always framed or on a background, big where they carry the message, black and white or with
big shadows allowed. References: sanalabs.com and similar sites (research: 150–300 words a
page, 3–7 word headlines, 0–30 words under each).

## Goals / non-goals / anti-goals
- Goals: one idea per page; copy cut to about a third; people photos used differently on
  each page; every section fits one laptop screen (1366 by 625); figures count up.
- Non-goals: changing other pages, nav, or the shared components other pages use.
- Anti-goals: dark or black section backgrounds; the same hero on two pages; a stock face
  next to a named quote; long paragraphs.

## Approaches considered
1. Restyle the shared components (EditorialHero etc.) per page with modifiers. Rejected:
   the pages would still share one skeleton.
2. Three bespoke page layouts built from small page-specific sections (chosen). Each view
   gets its own markup and a CSS block; shared pieces (Photo, CountUp, hrefFor) are reused.

## The design
- **AI Literacy: "People adopt what they understand."** Huge centred headline with one
  orange phrase; a wide black-and-white training-room photo under it, no frame, its bottom
  fading into the white page (mask-image). Six roles as one-line rows with thin rules. A tall
  photo beside one giant count-up figure (+87%) with three small figures. One-line delivery
  strip (UMU.com, 5,000+ per cohort, 6 weeks).
- **Advisory: "Diagnosis before demo."** Editorial, black and white. Split hero: B&W photo
  of advisors at a whiteboard bleeding to the left screen edge, headline on white at right.
  Six engagements as numbered rows (number, title, length, deliverable); clicking a row
  opens one sentence. Closing big quote, first clause in ink, rest grey, no portrait
  (attribution stays anonymous).
- **Content Development: "AI speed, human depth, MLR clean."** Hero: headline left; a human
  author photo with the real Forge workflow screen floating over it with a big shadow. A
  short two-column comparison (AI-powered Forge vs human-led) instead of cards. The 9-month
  launch as one horizontal line with three markers on white. Therapeutic areas as large
  slowly scrolling type.

## CMS
Manifest fields are Payload global fields (schema); defaults are placeholders only. Fields
are rewritten to match the new pages (shorter defaults, unused ones removed), which needs a
migration. The three page tables are empty locally.

## Left to the builder
Exact photos (Pexels; light or white backgrounds so they can sit unframed), crops, spacing,
responsive behaviour, CTA placement (one "Book a Consult" per page).
