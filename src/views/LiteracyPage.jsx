import Link from 'next/link';
import CountUp from '../components/CountUp';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './SolutionsPages.css';

// The hero heading keeps its orange phrase by default, but renders a plain string when
// an editor overrides it. This must match the manifest default.
const HERO_HEADING_DEFAULT = "Your team can't use AI it doesn't trust.";

const ROLES = [
  { tag: 'All roles', title: 'What AI actually does', line: 'Where it helps, where it fails, where judgment comes in.' },
  { tag: 'Medical · Regulatory', title: 'AI in a regulated world', line: 'MLR review, GxP validation and compliance.' },
  { tag: 'L&D · Marketing', title: 'AI for content', line: 'Prompting, checking outputs, verifying citations.' },
  { tag: 'Commercial · Sales', title: 'AI in field conversations', line: 'Coached preparation and HCP personas.' },
  { tag: 'Managers', title: 'AI and performance data', line: 'Reading readiness scores and what they measure.' },
  { tag: 'Leadership', title: 'An AI-ready culture', line: 'Experimenting safely and judging vendor claims.' },
];

const SMALL_FIGURES = [
  { n: '−72%', l: 'AI support tickets in the first 90 days' },
  { n: '3.8×', l: 'faster to value than tools-first roll-outs' },
  { n: '100%', l: 'of finishers pass the post-assessment' },
];

const DELIVERY = [
  { n: '5,000+', l: 'learners per cohort' },
  { n: '6 weeks', l: 'kickoff to certification' },
  { n: '3', l: 'regions' },
  { n: 'Any LMS', l: 'InsiteX, yours or UMU' },
];

/**
 * AI Literacy: "people adopt what they understand". The headline beside a woman cut out of
 * her photo, standing on the page with no frame or background; the six roles as plain
 * rows, one big result beside a photo on a soft orange band, and a one-line delivery strip. Styles: lit- in SolutionsPages.css.
 */
export default function LiteracyPage({ content }) {
  const c = makeGetter(content);
  const heading = c('hero.heading');
  const headline = heading === HERO_HEADING_DEFAULT
    ? <>Your team can&apos;t use AI it <em>doesn&apos;t trust.</em></>
    : heading;
  const contact = hrefFor('contact');

  return (
    <>
      <section className="lit-hero">
        <div className="lit-hero-text">
          <div className="t-eyebrow">{c('hero.eyebrow')}</div>
          <h1 className="lit-hero-h1">{headline}</h1>
          <p className="lit-hero-sub">{c('hero.subhead')}</p>
          <Link href={contact} className="bp as-btn">{c('hero.ctaLabel')}</Link>
        </div>
        <div className="lit-hero-person">
          <Photo name="portrait-cutout" sizes="(max-width: 960px) 90vw, 640px" priority />
        </div>
      </section>

      <section className="lit-roles">
        <div className="lit-roles-head">
          <div className="t-eyebrow">{c('tracks.eyebrow')}</div>
          <h2 className="lit-h2">{c('tracks.heading')}</h2>
        </div>
        <ol className="lit-role-list">
          {ROLES.map((r) => (
            <li key={r.title} className="lit-role">
              <span className="lit-role-tag">{r.tag}</span>
              <strong className="lit-role-title">{r.title}</strong>
              <span className="lit-role-line">{r.line}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="lit-proof-band">
        <div className="lit-proof">
          <div className="lit-proof-photo">
            <Photo name="trainer-with-charts" sizes="(max-width: 960px) 90vw, 440px" position="50% 35%" />
          </div>
          <div className="lit-proof-text">
            <div className="t-eyebrow">{c('whyLiteracy.eyebrow')}</div>
            <h2 className="lit-h2">{c('whyLiteracy.heading')}</h2>
            <div className="lit-big">
              <span className="lit-big-n"><CountUp>+87%</CountUp></span>
              <span className="lit-big-l">AI tool adoption, compared with roll-outs that skip literacy.</span>
            </div>
            <ul className="lit-small">
              {SMALL_FIGURES.map((f) => (
                <li key={f.n}>
                  <strong><CountUp>{f.n}</CountUp></strong>
                  <span>{f.l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="lit-delivery" aria-label={c('delivery.heading')}>
        <span className="lit-delivery-label">{c('delivery.heading')}</span>
        {DELIVERY.map((d) => (
          <span key={d.l} className="lit-delivery-item">
            <strong><CountUp>{d.n}</CountUp></strong> {d.l}
          </span>
        ))}
      </section>

      <section className="lit-close">
        <h2 className="lit-close-h">{c('cta.heading')}</h2>
        <p>{c('cta.body')}</p>
        <Link href={contact} className="bp as-btn">{c('cta.ctaLabel')}</Link>
      </section>
    </>
  );
}
