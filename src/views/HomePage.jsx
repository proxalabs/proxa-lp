import NameLoop from '../components/media/NameLoop';
import ProductTour from '../components/sections/ProductTour';
import ScrollStory from '../components/sections/ScrollStory';
import { PRODUCT_TOUR } from '../content/productTour';
import LoopVisual from '../components/LoopVisual';
import EditorialHero from '../components/sections/EditorialHero';
import StatBand from '../components/sections/StatBand';
import CardGrid from '../components/sections/CardGrid';
import PullQuote from '../components/sections/PullQuote';
import StepRail from '../components/sections/StepRail';
import CTABand from '../components/sections/CTABand';
import AnnouncementBand from '../components/AnnouncementBand';
import Icon from '../components/Icon';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import { HOME_HERO_HEADLINE_DEFAULT } from '../content/manifest';

const CLIENT_LOGOS = ["AbbVie","Allergan","Amgen","AstraZeneca","Bayer","Biogen","BMS","Genentech","GSK","Janssen","Merck","Novartis","Novo Nordisk","Pfizer","Roche","Sanofi","Takeda","Teva","Gilead","Mass General","Penn Medicine","MD Anderson"];

const STATS = [
  { n: "80–95%", l: "of pharma AI pilots never scale or deliver measurable value", source: "Source: Saama / Forbes, 2025" },
  { n: "11 mo",  l: "average ramp to full rep productivity in biopharma", source: "Source: Salesforce State of Sales, 2024" },
  { n: "84%",    l: "of pharma reps missed quota last year", source: "Source: Salesforce State of Sales, 2024" },
  { n: "25 yrs", l: "practitioner experience behind the Proxa Labs methodology", source: "Proxa Labs" },
];

// Each principle is its name and the one sentence that states it.
const DIFFERENTIATORS = [
  { icon: <Icon name="methodology" size={24} />, title: "Methodology", body: "We diagnose before we prescribe." },
  { icon: <Icon name="compliance" size={24} />,  title: "Compliance",  body: "Their compliance story is a retrofit. Ours is not." },
  { icon: <Icon name="award" size={24} />,       title: "Insider",     body: "We don't need you to explain pharma to us." },
  { icon: <Icon name="pilot" size={24} />,       title: "Experiment",  body: "You don't commit until you have evidence." },
];

// The four topics of the scrolling section; each `id` is the animation that goes with it
// (media/LineMotion.jsx).
const STORY_STEPS = [
  { id: "ai",        title: "AI",        heading: "AI does the heavy lifting.", text: "AI agents draft, check and adapt the work. People make the calls that matter." },
  { id: "cloud",     title: "Cloud",     heading: "Everything in one place.", text: "Content, learners and results come together in the cloud, so every team works from the same picture." },
  { id: "analysis",  title: "Analysis",  heading: "Analysis you can read at a glance.", text: "Live charts show readiness by team, region and stage, with no spreadsheet to decode." },
  { id: "automation", title: "Automation", heading: "The loop runs itself.", text: "When a gap shows up, the content is rebuilt and reassigned automatically. No handoffs, no stalled follow-ups." },
];

const STEPS = [
  { n: "01", title: "Start where you are", body: "InsiteX LMS or traditional content. Proven, compliant, built for pharma." },
  { n: "02", title: "Assess your AI readiness", body: "Advisory team maps your constraints before recommending anything. No technology pitch." },
  { n: "03", title: "Build AI literacy across your team", body: "Equip every role — reps, managers, medical affairs — with the fluency to adopt AI tools effectively.", highlight: true },
  { n: "04", title: "Experiment before committing", body: "Structured pilots generate evidence in your environment before you scale." },
  { n: "05", title: "Deploy with confidence", body: "Forge, Cue, and Stage built to survive your governance environment." },
];

export default function HomePage({ content }) {
  const c = makeGetter(content);
  // Headline keeps its rich (italic) default, but renders a plain string if overridden.
  const hh = c('hero.headline');
  const heroHeadline = hh === HOME_HERO_HEADLINE_DEFAULT
    ? <span className="home-hero-headline">The AI commercial learning partner <em>built for biopharma</em>. Not adapted for it.</span>
    : <span className="home-hero-headline">{hh}</span>;
  return (
    <>
      <EditorialHero
        eyebrow={c('hero.eyebrow')}
        headline={heroHeadline}
        subhead={c('hero.subhead')}
        primaryCta={{ label: c('hero.ctaLabel'), href: hrefFor("platform") }}
        visual={<LoopVisual />}
        className="hero-with-loop"
      />

      <div className="logo-band">
        <h2 className="t-h2 lb-label">{c('logoBand.label')}</h2>
        <NameLoop names={CLIENT_LOGOS} label={c('logoBand.label')} />
      </div>

      <StatBand stats={STATS} />

      <AnnouncementBand
        icon={<Icon name="literacy" size={24} color="#D97706" />}
        tag="New"
        title="AI Literacy Program — the prerequisite every AI deployment needs."
        description="Build AI fluency across every role before tools go live. Teams that understand AI adopt it. Teams that don't, resist it."
        primaryCta={{ label: "See the Program", href: hrefFor("literacy") }}
      />

      <CardGrid
        eyebrow="Four Principles for Evaluating Any AI Partner"
        heading="How do you know if AI is actually working in your organization?"
        lead="These four principles are how Proxa Labs diagnoses whether AI is actually delivering, and how our practitioners have built 25 years of award-winning work around them."
        columns={4}
        cards={DIFFERENTIATORS}
        cardStyle="plain"
        background="tinted"
        centerHeader
        leadMaxWidth={920}
      />

      <ProductTour
        eyebrow="Product tour"
        heading="The platform, up close."
        cta={{ label: "Explore the platform", href: hrefFor("platform") }}
        note="Screens from the four Proxa apps running demo content."
        slides={PRODUCT_TOUR}
      />

      <ScrollStory label="The intelligence behind it" steps={STORY_STEPS} />

      <PullQuote
        quote="We had been trying to make AI work for 18 months. Two pilots, two postmortems, and a CCO who was starting to ask whether L&D could actually lead this. What Proxa Labs did differently was refuse to let us skip the hard part — defining what success actually looked like before we built anything. We walked into our budget review with evidence, not a pitch deck."
        author={{ name: "Sarah Chen", title: "VP, Commercial Learning & Development", company: "Mid-Size Oncology Biopharma · Series C" }}
        photo="team-round-table"
        photoPosition="70% 50%"
        stats={[
          { n: "23%", l: "improvement in manager-assessed call quality" },
          { n: "0",   l: "MLR compliance flags across all sessions" },
          { n: "3 wks", l: "from pilot conclusion to CCO approval" },
          { n: "6 mo", l: "full AI roadmap funded and in execution" },
        ]}
      />

      <StepRail
        eyebrow="For Every Stage of the Journey"
        heading="From where you are to AI-ready."
        lead="Four-plus years of InsiteX enterprise learning infrastructure in biopharma. A closed-loop AI platform built on top of it. You decide when and how fast to move."
        steps={STEPS}
        background="tinted"
        orientation="horizontal"
        centerHeader
        className="journey-step-rail"
      />

      <CTABand
        heading={<>Asked to deliver on AI?<br /><em>Let's work out how.</em></>}
        body={c('cta.body')}
        primaryCta={{ label: c('cta.ctaLabel'), href: hrefFor("contact") }}
      />
    </>
  );
}
