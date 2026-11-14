import EditorialHero from '../components/sections/EditorialHero';
import StatBand from '../components/sections/StatBand';
import CardGrid from '../components/sections/CardGrid';
import CTABand from '../components/sections/CTABand';
import SplitFeature from '../components/sections/SplitFeature';
import PullQuote from '../components/sections/PullQuote';
import FaqSection from '../components/sections/FaqSection';
import LogoStrip from '../components/sections/LogoStrip';
import FormSectionBlock from '../components/FormSectionBlock';
import RichTextSection from '../components/sections/RichTextSection';
import { hrefFor } from './routes';

/*
 * The "kit of ready-made sections" (Mercy's S3). Each section type wraps a real
 * on-brand site component and turns a section's data into that component's
 * props. The fields a marketer fills are defined by the CMS blocks in
 * src/blocks/page.ts. Buttons link with hrefFor(pageKey).
 */
export const SECTION_KIT = {
  hero: {
    label: 'Hero banner',
    render: (d) => (
      <EditorialHero eyebrow={d.eyebrow} headline={d.headline} subhead={d.subhead} dark={!!d.dark}
        primaryCta={d.ctaLabel ? { label: d.ctaLabel, href: hrefFor(d.ctaPage || 'contact') } : undefined} />
    ),
  },
  split: {
    label: 'Text + image',
    render: (d) => (
      <SplitFeature eyebrow={d.eyebrow} heading={d.heading} body={d.body} reverse={!!d.reverse}
        visual={d.image ? <img src={d.image} alt={d.imageAlt || ''} loading="lazy" style={{ width: '100%', borderRadius: 16, display: 'block' }} /> : null} />
    ),
  },
  richText: {
    label: 'Formatted text',
    render: (d) => <RichTextSection heading={d.heading} body={d.body} />,
  },
  cards: {
    label: 'Feature cards',
    render: (d) => (
      <CardGrid eyebrow={d.eyebrow} heading={d.heading} lead={d.lead} centerHeader
        cards={(d.cards || []).map((c) => ({ title: c.title, body: c.body }))} />
    ),
  },
  stats: {
    label: 'Stat band',
    render: (d) => <StatBand stats={(d.stats || []).map((s) => ({ n: s.value, l: s.label, source: s.source || undefined }))} />,
  },
  quote: {
    label: 'Pull quote',
    render: (d) => <PullQuote quote={d.quote} author={d.author} />,
  },
  cta: {
    label: 'Call to action',
    render: (d) => (
      <CTABand heading={d.heading} body={d.body}
        primaryCta={d.ctaLabel ? { label: d.ctaLabel, href: hrefFor(d.ctaPage || 'contact') } : undefined} />
    ),
  },
  faq: {
    label: 'FAQ',
    render: (d) => <FaqSection heading={d.heading} items={d.items} />,
  },
  logoStrip: {
    label: 'Logo strip',
    render: (d) => <LogoStrip heading={d.heading} logos={d.logos} />,
  },
  form: {
    label: 'Form',
    render: (d) => <FormSectionBlock heading={d.heading} form={d.form} />,
  },
};

export const SECTION_TYPES = Object.keys(SECTION_KIT);
