/*
 * Editable-content manifest for the Advisory page (pageId: "advisory").
 * Each field's default is the copy written in AdvisoryPage.jsx; the page renders an
 * override when present, otherwise the default.
 */
export default {
  label: 'Advisory',
  fields: [
    // Hero
    { key: 'hero.eyebrow', label: 'Hero eyebrow', type: 'text',
      default: 'Advisory' },
    { key: 'hero.headline', label: 'Hero headline', type: 'textarea',
      default: 'Most vendors lead with a demo. We lead with a diagnosis.' },
    { key: 'hero.subhead', label: 'Hero subhead', type: 'textarea',
      default: 'Six short, fixed-scope engagements. Each one ends with something you can act on.' },

    // The big figure
    { key: 'why.eyebrow', label: 'Figure eyebrow', type: 'text',
      default: 'Why diagnose first' },
    { key: 'why.heading', label: 'Figure (counts up)', type: 'text',
      default: '80–95%' },
    { key: 'why.body1', label: 'Figure line', type: 'textarea',
      default: 'of pharma AI pilots fail for reasons that have nothing to do with the technology. We find yours before you build.' },

    // Engagements
    { key: 'engagements.eyebrow', label: 'Engagements eyebrow', type: 'text',
      default: 'Six engagements' },
    { key: 'engagements.heading', label: 'Engagements heading', type: 'text',
      default: 'Start where you are.' },
    { key: 'engagements.0.title', label: 'Engagement 1 title', type: 'text',
      default: 'AI Strategy & Roadmap Workshop' },
    { key: 'engagements.0.body', label: 'Engagement 1 line', type: 'textarea',
      default: 'A half day with your leadership team to agree priorities and use cases. The lowest-risk place to start.' },
    { key: 'engagements.1.title', label: 'Engagement 2 title', type: 'text',
      default: 'AI Readiness & Maturity Assessment' },
    { key: 'engagements.1.body', label: 'Engagement 2 line', type: 'textarea',
      default: 'Four weeks to see where you stand, where the gaps are, and what to fix first.' },
    { key: 'engagements.2.title', label: 'Engagement 3 title', type: 'text',
      default: 'Learning Technology & GenAI Assessment' },
    { key: 'engagements.2.body', label: 'Engagement 3 line', type: 'textarea',
      default: 'Vendors, compliance risk and integration, checked so the buying decision holds up with IT, Legal and Compliance.' },
    { key: 'engagements.3.title', label: 'Engagement 4 title', type: 'text',
      default: 'AI Governance & Compliance Framework' },
    { key: 'engagements.3.body', label: 'Engagement 4 line', type: 'textarea',
      default: 'Rules, monitoring and incident playbooks for AI-generated content, aligned to MLR and FDA guidance.' },
    { key: 'engagements.4.title', label: 'Engagement 5 title', type: 'text',
      default: 'Learning Infrastructure Assessment' },
    { key: 'engagements.4.body', label: 'Engagement 5 line', type: 'textarea',
      default: 'Your data and systems reviewed, so the prerequisites are in place before AI tools arrive.' },
    { key: 'engagements.5.title', label: 'Engagement 6 title', type: 'text',
      default: 'AI-Optimized Org Design' },
    { key: 'engagements.5.body', label: 'Engagement 6 line', type: 'textarea',
      default: 'Roles, reporting lines and hiring plans for AI-enabled learning at scale.' },

    // Quote
    { key: 'testimonial.quote', label: 'Quote', type: 'textarea',
      default: 'The diagnostic call took 30 minutes and saved us 9 months of building the wrong thing. Our blocker was MLR throughput, not roleplay coverage.' },
    { key: 'testimonial.author.name', label: 'Quote author role', type: 'text',
      default: 'VP, Commercial L&D' },
    { key: 'testimonial.author.title', label: 'Quote author company', type: 'text',
      default: 'Top-10 Global Pharma' },

    // Closing
    { key: 'cta.heading', label: 'Closing heading', type: 'textarea',
      default: 'Not sure where to start? Good.' },
    { key: 'cta.body', label: 'Closing line', type: 'textarea',
      default: "30 minutes. No demo. We'll tell you what we'd look at first." },
    { key: 'cta.label', label: 'Button label', type: 'text',
      default: 'Book a Consult' },
  ],
};
