/*
 * Editable-content manifest for the Content Development page (pageId: "content").
 * Each field's default is the copy written in ContentPage.jsx; the page renders an
 * override when present, otherwise the default.
 */
export default {
  label: 'Content Development',
  fields: [
    // Hero
    { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
      default: 'Content Development' },
    { key: 'hero.headline', label: 'Hero headline', type: 'textarea',
      default: 'MLR-compliant content. Built for field readiness.' },
    { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
      default: 'AI speed when the launch is close. Human depth where it matters. Usually both.' },
    { key: 'hero.ctaLabel', label: 'Hero button label', type: 'text',
      default: 'Book a Consult' },

    // Two tracks
    { key: 'tracks.eyebrow', label: 'Tracks eyebrow', type: 'text',
      default: 'Two tracks, one standard' },
    { key: 'tracks.heading', label: 'Tracks heading', type: 'text',
      default: 'AI-powered, human-led, or both.' },
    { key: 'track1.title', label: 'Track 1 title', type: 'text',
      default: 'AI-powered Forge' },
    { key: 'track1.body', label: 'Track 1 best for', type: 'text',
      default: 'Foundational modules on a tight timeline' },
    { key: 'track2.title', label: 'Track 2 title', type: 'text',
      default: 'Human-led design' },
    { key: 'track2.body', label: 'Track 2 best for', type: 'text',
      default: 'High-stakes, nuanced field conversations' },
    { key: 'standards.label', label: 'Standards label', type: 'text',
      default: 'Every output' },
    { key: 'standards.item1.title', label: 'Standard 1', type: 'text',
      default: 'MLR-routable' },
    { key: 'standards.item2.title', label: 'Standard 2', type: 'text',
      default: 'Field-validated' },
    { key: 'standards.item3.title', label: 'Standard 3', type: 'text',
      default: 'Measured by behaviour, not completion' },

    // Example launch
    { key: 'scenario.eyebrow', label: 'Launch eyebrow', type: 'text',
      default: 'Example launch' },
    { key: 'scenario.heading', label: 'Launch heading', type: 'text',
      default: '9 months. 3 indications. 1 content team.' },
    { key: 'scenario.phase1.title', label: 'Launch step 1', type: 'text',
      default: 'Human-led depth for the lead indication' },
    { key: 'scenario.phase2.title', label: 'Launch step 2', type: 'text',
      default: 'Forge drafts indications two and three' },
    { key: 'scenario.phase3.title', label: 'Launch step 3', type: 'text',
      default: 'Practitioners validate before MLR' },
    { key: 'scenario.outcome', label: 'Launch outcome', type: 'text',
      default: 'All three launched on time, MLR-cleared.' },

    // Therapeutic areas
    { key: 'therapeutic.eyebrow', label: 'Therapeutic eyebrow', type: 'text',
      default: 'Therapeutic areas' },
    { key: 'therapeutic.heading', label: 'Therapeutic heading', type: 'text',
      default: 'Launch training across ten of them.' },
  ],
};
