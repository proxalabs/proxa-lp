import Link from 'next/link';
import CountUp from '../components/CountUp';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './SolutionsPages.css';

// The headline keeps its orange second sentence by default, but renders a plain string
// when an editor overrides it. This must match the manifest default.
const HERO_HEADLINE_DEFAULT = 'Most vendors lead with a demo. We lead with a diagnosis.';

// What each engagement hands over, in the order of the manifest's engagements.0–5.
const DELIVERABLES = [
  '12-month AI roadmap',
  'Maturity scorecard',
  'A decision you can defend',
  'Governance framework',
  'Modernization roadmap',
  'Org design and hiring plan',
];

/** "First sentence. The rest." → ["First sentence.", "The rest."] */
function splitFirstSentence(text) {
  const match = /^(.+?[.!?])\s+(.+)$/s.exec(text || '');
  return match ? [match[1], match[2]] : [text, ''];
}

/**
 * Advisory: "diagnosis before demo". A centred headline over a wide photo of a session
 * where someone is asking the question. Then one large figure, the six engagements as
 * numbered rows that open to a single line beside a photo, and the client quote set large
 * on a grey band. Styles: adv- in SolutionsPages.css.
 */
export default function AdvisoryPage({ content }) {
  const c = makeGetter(content);
  const hh = c('hero.headline');
  const headline = hh === HERO_HEADLINE_DEFAULT
    ? <>Most vendors lead with a demo. <em>We lead with a diagnosis.</em></>
    : hh;
  const [quoteLead, quoteRest] = splitFirstSentence(c('testimonial.quote'));
  const contact = hrefFor('contact');

  return (
    <>
      <section className="adv-hero">
        <div className="adv-hero-text">
          <div className="t-eyebrow">{c('hero.eyebrow')}</div>
          <h1 className="adv-hero-h1">{headline}</h1>
          <p className="adv-hero-sub">{c('hero.subhead')}</p>
          <Link href={contact} className="bp as-btn">{c('cta.label')}</Link>
        </div>
        <div className="adv-hero-photo">
          <Photo name="trainer-question" sizes="(max-width: 1312px) 100vw, 1200px" position="50% 28%" priority />
        </div>
      </section>

      <section className="adv-figure">
        <div className="t-eyebrow">{c('why.eyebrow')}</div>
        <div className="adv-figure-n"><CountUp>{c('why.heading')}</CountUp></div>
        <p className="adv-figure-l">{c('why.body1')}</p>
      </section>

      <section className="adv-engage">
        <div className="adv-engage-side">
          <div className="t-eyebrow">{c('engagements.eyebrow')}</div>
          <h2 className="adv-h2">{c('engagements.heading')}</h2>
          <div className="adv-engage-photo">
            <Photo name="advisor-conversation" sizes="(max-width: 960px) 90vw, 420px" position="50% 40%" />
          </div>
        </div>
        <div className="adv-engage-list">
          {DELIVERABLES.map((deliverable, i) => (
            <details key={deliverable} className="adv-row" open={i === 0}>
              <summary>
                <span className="adv-row-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="adv-row-title">{c(`engagements.${i}.title`)}</span>
                <span className="adv-row-out">{deliverable}</span>
                <span className="adv-row-plus" aria-hidden="true" />
              </summary>
              <p>{c(`engagements.${i}.body`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="adv-quote">
        <blockquote>
          <p><span className="adv-quote-lead">“{quoteLead}</span>{quoteRest && <> {quoteRest}”</>}{!quoteRest && '”'}</p>
          <footer>{c('testimonial.author.name')} · {c('testimonial.author.title')}</footer>
        </blockquote>
      </section>

      <section className="adv-close">
        <h2 className="adv-close-h">{c('cta.heading')}</h2>
        <div className="adv-close-side">
          <p>{c('cta.body')}</p>
          <Link href={contact} className="bp as-btn">{c('cta.label')}</Link>
        </div>
      </section>
    </>
  );
}
