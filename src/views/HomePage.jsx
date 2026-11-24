import ClientLogoLoop from '../components/media/ClientLogoLoop';
import ProductTour from '../components/sections/ProductTour';
import ScrollStory from '../components/sections/ScrollStory';
import { PRODUCT_TOUR } from '../content/productTour';
import { CLIENT_LOGOS } from '../content/clientLogos';
import PhotoHero from '../components/sections/PhotoHero';
import StatBand from '../components/sections/StatBand';
import PhotoQuote from '../components/sections/PhotoQuote';
import WhatsNewBanner from '../components/WhatsNewBanner';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import { HOME_HERO_HEADLINE_DEFAULT } from '../content/manifest';

const STATS = [
  { n: "80–95%", l: "of pharma AI pilots never scale or deliver measurable value", source: "Source: Saama / Forbes, 2025" },
  { n: "11 mo",  l: "average ramp to full rep productivity in biopharma", source: "Source: Salesforce State of Sales, 2024" },
  { n: "84%",    l: "of pharma reps missed quota last year", source: "Source: Salesforce State of Sales, 2024" },
  { n: "25 yrs", l: "practitioner experience behind the Proxa Labs methodology", source: "Proxa Labs" },
];

// The four topics of the scrolling section; each `id` is the animation that goes with it
// (media/LineMotion.jsx).
const STORY_STEPS = [
  { id: "ai",        title: "AI",        heading: "AI does the heavy lifting.", text: "AI agents draft, check and adapt the work. People make the calls that matter." },
  { id: "cloud",     title: "Cloud",     heading: "Everything in one place.", text: "Content, learners and results come together in the cloud, so every team works from the same picture." },
  { id: "analysis",  title: "Analysis",  heading: "Analysis you can read at a glance.", text: "Live charts show readiness by team, region and stage, with no spreadsheet to decode." },
  { id: "automation", title: "Automation", heading: "The loop runs itself.", text: "When a gap shows up, the content is rebuilt and reassigned automatically. No handoffs, no stalled follow-ups." },
];

export default function HomePage({ content }) {
  const c = makeGetter(content);
  // The built-in headline has its last word underlined with a brush stroke; a headline
  // typed into the CMS is shown as plain text.
  const hh = c('hero.headline');
  const heroHeadline = hh === HOME_HERO_HEADLINE_DEFAULT
    ? <>Workforce intelligence, <em>reinvented.</em></>
    : hh;
  return (
    <>
      <PhotoHero
        eyebrow={c('hero.eyebrow')}
        headline={heroHeadline}
        subhead={c('hero.subhead')}
        primaryCta={{ label: c('hero.ctaLabel'), href: hrefFor("about") }}
        secondaryLink={{ label: "Explore our platform", href: hrefFor("platform") }}
        photo="team-around-laptop"
      />

      <div className="logo-band">
        <h2 className="t-h2 lb-label">{c('logoBand.label')}</h2>
        <ClientLogoLoop logos={CLIENT_LOGOS} label={c('logoBand.label')} />
      </div>

      <ProductTour
        eyebrow="The future of enablement"
        heading="Rethinking the next generation of workforce readiness."
        slides={PRODUCT_TOUR}
      />

      <StatBand stats={STATS} />

      <ScrollStory label="The intelligence behind it" steps={STORY_STEPS} />

      {/* The figures count up (components/CountUp.jsx); the big line is the closing
          sentence of the quote, which reads on its own. */}
      <PhotoQuote
        kicker="Mid-size oncology biopharma · Series C"
        quote="We walked into our budget review with evidence, not a pitch deck."
        name="Sarah Chen"
        title="VP, Commercial Learning & Development"
        photo="quote-portrait"
        position="50% 50%"
        phonePosition="82% 40%"
        tone="#1f1714"
        stats={[
          { n: "23%", l: "better manager-assessed call quality" },
          { n: "0",   l: "MLR compliance flags" },
          { n: "3 wks", l: "from pilot to CCO approval" },
          { n: "6 mo", l: "to a funded AI roadmap" },
        ]}
      />

      <WhatsNewBanner label={c('whatsNew.label')} href={c('whatsNew.link')} />
    </>
  );
}
