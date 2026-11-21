/*
 * Editable-content fields for the "proxalab" page (The Lab). Each default is the copy the
 * page shows when nothing is overridden. The hero heading keeps its orange second half
 * by default (see ProxaLabsPage.jsx) and renders a plain string only when overridden.
 */
export default {
  label: 'The Lab',
  fields: [
    // Hero
    { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
      default: 'The Lab' },
    { key: 'hero.heading', label: 'Hero heading', type: 'textarea',
      default: 'Prove it before you scale it.' },
    { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
      default: 'Structured AI experiments for biopharma commercial teams. Four phases, six to ten weeks, one defensible answer.' },
    { key: 'hero.ctaLabel', label: 'Hero button label', type: 'text', default: 'Book a Consult' },

    // Why pilots fail
    { key: 'failures.eyebrow', label: 'Why-pilots-fail eyebrow', type: 'text',
      default: 'Why AI pilots fail' },
    { key: 'failures.heading', label: 'Why-pilots-fail heading', type: 'textarea',
      default: 'Three patterns behind most pharma AI postmortems.' },

    // The method
    { key: 'phases.eyebrow', label: 'Method eyebrow', type: 'text',
      default: 'The method' },
    { key: 'phases.heading', label: 'Method heading', type: 'text',
      default: 'Four phases. Six to ten weeks.' },
    { key: 'phases.outcome', label: 'Method outcome', type: 'textarea',
      default: 'You leave with a funded AI roadmap, or a defensible decision not to invest.' },

    // Quote
    { key: 'longform.pullQuote', label: 'Quote', type: 'textarea',
      default: "A failed AI pilot doesn't just cost a budget line. It costs launch momentum and CCO trust." },
    { key: 'longform.pullQuoteAttribution', label: 'Quote attribution', type: 'text',
      default: 'Nina Patel, Research Lead, The Lab' },

    // Open research
    { key: 'research.eyebrow', label: 'Research eyebrow', type: 'text',
      default: 'Open research' },
    { key: 'research.heading', label: 'Research heading', type: 'text',
      default: "What we're testing now." },
  ],
};
