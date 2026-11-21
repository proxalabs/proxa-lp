import Link from 'next/link';
import CountUp from '../components/CountUp';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './LabPage.css';

// The heading keeps its orange second half by default, but renders a plain string when an
// editor overrides it. This must match the manifest default.
const HERO_HEADING_DEFAULT = 'Prove it before you scale it.';

const FAILURES = [
  { title: 'Too broad.', line: '“Use AI in training” is a mandate, not a use case.' },
  { title: 'Built to pass, not to prove.', line: 'A controlled demo says nothing about your real constraints.' },
  { title: 'No business case.', line: 'Leadership funds ROI and risk, not learning metrics.' },
];

const PHASES = [
  { title: 'Define the use case', deliverable: 'Validated use case statement' },
  { title: 'Design the experiment', deliverable: 'Experiment design canvas' },
  { title: 'Measure what matters', deliverable: 'Baseline and measurement plan' },
  { title: 'Build the business case', deliverable: 'CCO-ready business case' },
];

const RESEARCH = [
  { figure: '$10K', tone: 'o', status: 'Recruiting', title: 'Open-source HCP avatar engine', line: 'A hackathon prize pool to build a roleplay avatar no vendor owns.' },
  { figure: '0.84', tone: 'bl', status: 'Early results', title: 'Behaviour vs. field performance', line: 'Correlation between AI-assessed skills and results in the field.' },
  { figure: '30+', tone: 'dk', status: 'In development', title: 'Pilot success predictor', line: 'Advisory engagements training a model of which pilots will work.' },
];

/**
 * The Lab: "prove it before you scale it". A plain photo of a team reading results beside
 * the headline; then the three ways pilots fail; the four phases either side of a scientist
 * cut out of his photo, standing on the page with no frame or background; the open
 * research as three counting figures; and a quote set large.
 * Styles: LabPage.css.
 */
export default function ProxaLabsPage({ content }) {
  const c = makeGetter(content);
  const hh = c('hero.heading');
  const heading = hh === HERO_HEADING_DEFAULT
    ? <>Prove it <em>before you scale&nbsp;it.</em></>
    : hh;

  return (
    <>
      <section className="lab-hero">
        <div className="lab-hero-text">
          <div className="t-eyebrow">{c('hero.eyebrow')}</div>
          <h1 className="lab-hero-h1">{heading}</h1>
          <p className="lab-hero-sub">{c('hero.subhead')}</p>
          <Link href={hrefFor('contact')} className="bp as-btn">{c('hero.ctaLabel')}</Link>
        </div>
        <div className="lab-hero-visual">
          <Photo name="lab-team-results" sizes="(max-width: 960px) 100vw, 600px" position="60% 40%" priority />
        </div>
      </section>

      <section className="lab-fail">
        <div className="lab-wrap">
          <div className="t-eyebrow">{c('failures.eyebrow')}</div>
          <h2 className="lab-h2">{c('failures.heading')}</h2>
          <ol className="lab-fail-list">
            {FAILURES.map((f, i) => (
              <li key={f.title}>
                <span className="lab-fail-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.title}</h3>
                <p>{f.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lab-method">
        <div className="lab-wrap">
          <div className="lab-method-head">
            <div className="t-eyebrow">{c('phases.eyebrow')}</div>
            <h2 className="lab-h2">{c('phases.heading')}</h2>
            <p className="lab-outcome">{c('phases.outcome')}</p>
          </div>
          <div className="lab-method-stage">
            {[PHASES.slice(0, 2), PHASES.slice(2)].map((pair, side) => (
              <ol key={side} className={`lab-steps lab-steps-${side ? 'right' : 'left'}`} start={side * 2 + 1}>
                {pair.map((p, i) => (
                  <li key={p.title} className="lab-step">
                    <span className="lab-step-n" aria-hidden="true">{side * 2 + i + 1}</span>
                    <h3>{p.title}</h3>
                    <p>{p.deliverable}</p>
                  </li>
                ))}
              </ol>
            ))}
            <div className="lab-method-person">
              <Photo name="scientist-cutout" sizes="(max-width: 960px) 70vw, 380px" />
            </div>
          </div>
        </div>
      </section>


      <section className="lab-research">
        <div className="lab-wrap">
          <div className="t-eyebrow">{c('research.eyebrow')}</div>
          <h2 className="lab-h2">{c('research.heading')}</h2>
          <ul className="lab-research-list">
            {RESEARCH.map((r) => (
              <li key={r.title}>
                <span className={`lab-research-n lab-tone-${r.tone}`}><CountUp>{r.figure}</CountUp></span>
                <span className="lab-status">{r.status}</span>
                <h3>{r.title}</h3>
                <p>{r.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lab-quote">
        <blockquote>
          <p>{c('longform.pullQuote')}</p>
          <footer>{c('longform.pullQuoteAttribution')}</footer>
        </blockquote>
      </section>
    </>
  );
}
