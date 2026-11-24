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
import newsletter from './pages/newsletter.js';
import contact from './pages/contact.js';
import futureproof from './pages/futureproof.js';
import innovation from './pages/innovation.js';

export const MANIFEST = {
  home: {
    label: 'Homepage',
    fields: [
      // No eyebrow unless one is typed in: the hero is the headline over a photograph.
      { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
        default: '' },
      { key: 'hero.headline', label: 'Hero headline', type: 'textarea',
        default: 'Workforce intelligence, reinvented.' },
      { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
        default: 'The AI commercial learning partner built for biopharma. Not adapted for it.' },
      { key: 'hero.ctaLabel', label: 'Hero button label', type: 'text', default: 'See the vision' },
      { key: 'logoBand.label', label: 'Logo band label', type: 'text',
        default: 'Trusted across biopharma and health systems' },
      { key: 'cta.body', label: 'Closing CTA paragraph', type: 'textarea',
        default: "Proxa Labs works with commercial L&D leaders who have been told to deliver on AI but haven't found a partner who understands what that actually requires in a biopharma environment. Start with a conversation. We'll tell you what we'd look at first." },
      { key: 'cta.ctaLabel', label: 'Closing CTA button label', type: 'text', default: 'Book a Consult' },
      // The floating "what's new" button at the bottom right. The link can be any address:
      // a page of this site ("/ai-literacy") or a full web address.
      { key: 'whatsNew.label', label: "What's new button text", type: 'text',
        default: "See what's new in AI Literacy" },
      { key: 'whatsNew.link', label: "What's new button link", type: 'text',
        default: '/ai-literacy' },
    ],
  },
  platform, advisory, literacy, insitex, content, proxalab,
  about, news, newsletter, contact, futureproof, innovation,
};

// Special-case constant so the homepage can render its built-in headline with the last
// word underlined, but a plain string when overridden.
export const HOME_HERO_HEADLINE_DEFAULT = 'Workforce intelligence, reinvented.';

// Flat { key: default } map for a page.
export function defaultsFor(pageId) {
  const page = MANIFEST[pageId];
  if (!page) return {};
  return Object.fromEntries(page.fields.map((f) => [f.key, f.default]));
}
