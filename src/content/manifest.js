/*
 * Editable-content manifest. Each page lists the fields an editor can override
 * in the CMS, with the current copy as the in-code default. The page renders the
 * override when present, otherwise the default — so the site always works even
 * with no overrides. Add a page/fields here, then read them via usePageContent.
 */
import platform from './pages/platform.js';
import advisory from './pages/advisory.js';
import literacy from './pages/literacy.js';
import insitex from './pages/insitex.js';
import content from './pages/content.js';
import proxalab from './pages/proxalab.js';
import about from './pages/about.js';
import news from './pages/news.js';
import resources from './pages/resources.js';
import newsletter from './pages/newsletter.js';
import contact from './pages/contact.js';
import futureproof from './pages/futureproof.js';
import innovation from './pages/innovation.js';

export const MANIFEST = {
  home: {
    label: 'Homepage',
    fields: [
      { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
        default: 'FOR COMMERCIAL L&D LEADERS IN BIOPHARMA' },
      { key: 'hero.headline', label: 'Hero headline', type: 'textarea',
        default: 'The AI commercial learning partner built for biopharma. Not adapted for it.' },
      { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
        default: 'Most platforms were retrofitted for pharma. Proxa Labs was built from day one around MLR review and launch timelines: advisory, AI literacy and a closed-loop platform.' },
      { key: 'hero.ctaLabel', label: 'Hero button label', type: 'text', default: 'See the Platform' },
      { key: 'logoBand.label', label: 'Logo band label', type: 'text',
        default: 'Trusted across biopharma and health systems' },
      { key: 'cta.body', label: 'Closing CTA paragraph', type: 'textarea',
        default: "Proxa Labs works with commercial L&D leaders who have been told to deliver on AI but haven't found a partner who understands what that actually requires in a biopharma environment. Start with a conversation. We'll tell you what we'd look at first." },
      { key: 'cta.ctaLabel', label: 'Closing CTA button label', type: 'text', default: 'Book a Consult' },
    ],
  },
  platform, advisory, literacy, insitex, content, proxalab,
  about, news, resources, newsletter, contact, futureproof, innovation,
};

// Special-case constant so the homepage can render its rich (italic) headline as
// the default but a plain string when overridden.
export const HOME_HERO_HEADLINE_DEFAULT =
  'The AI commercial learning partner built for biopharma. Not adapted for it.';

// Flat { key: default } map for a page.
export function defaultsFor(pageId) {
  const page = MANIFEST[pageId];
  if (!page) return {};
  return Object.fromEntries(page.fields.map((f) => [f.key, f.default]));
}
