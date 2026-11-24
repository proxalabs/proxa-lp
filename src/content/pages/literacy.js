/*
 * Editable-content manifest for the AI Literacy Program page (pageId: "literacy").
 * Each field's default is the copy written in LiteracyPage.jsx; the page renders an
 * override when present, otherwise the default. See src/lib/content.js (usePageContent).
 *
 * The hero heading has an orange phrase in the JSX. Its default below is the plain-text
 * equivalent; the page renders the rich default and only swaps in a plain string when an
 * editor overrides it.
 */
export default {
  label: 'AI Literacy Program',
  fields: [
    { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
      default: 'AI Literacy Program' },
    { key: 'hero.heading', label: 'Hero heading', type: 'textarea',
      default: "Your team can't use AI it doesn't trust." },
    { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
      default: 'Role-based training that gives people the judgment to use AI well, before the tools arrive.' },
    { key: 'hero.ctaLabel', label: 'Hero button label', type: 'text',
      default: 'Get the Program Overview' },

    { key: 'tracks.eyebrow', label: 'Roles — eyebrow', type: 'text',
      default: 'Six tracks, one per role' },
    { key: 'tracks.heading', label: 'Roles — heading', type: 'text',
      default: 'Built for every role that touches AI.' },

    { key: 'whyLiteracy.eyebrow', label: 'Results — eyebrow', type: 'text',
      default: 'Why literacy first' },
    { key: 'whyLiteracy.heading', label: 'Results — heading', type: 'textarea',
      default: 'Teams that understand AI adopt it.' },

    { key: 'delivery.heading', label: 'Delivery — label', type: 'text',
      default: 'Delivered with UMU.com' },

    { key: 'cta.heading', label: 'Closing heading', type: 'text',
      default: 'Literacy first. Tools second.' },
    { key: 'cta.body', label: 'Closing line', type: 'textarea',
      default: "One call, and we'll map a literacy rollout for your organization." },
    { key: 'cta.ctaLabel', label: 'Closing button label', type: 'text',
      default: 'Book a Consult' },
  ],
};
