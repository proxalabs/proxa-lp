import Link from 'next/link';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './SolutionsPages.css';

const THERAPY_AREAS = ['Oncology', 'Hematology', 'Immunology', 'Cardiology', 'Endocrinology', 'Neurology', 'Rare Disease', 'Vaccines', 'Anti-Infectives', 'Respiratory'];

// The headline keeps its orange second sentence by default, but renders a plain string
// when an editor overrides it. This must match the manifest default.
const HERO_HEADLINE_DEFAULT = 'MLR-compliant content. Built for field readiness.';

// The example launch as bars on a 9-month line: where each step starts and ends, in months.
const LAUNCH = [
  { key: 'phase1', from: 0, to: 3, months: 'Months 1–3', tone: 'human' },
  { key: 'phase2', from: 1, to: 6, months: 'Months 2–6', tone: 'ai' },
  { key: 'phase3', from: 3, to: 7, months: 'Months 4–7', tone: 'both' },
];
const LAUNCH_MONTHS = 9;

/**
 * Content Development: "AI speed, human depth, MLR clean". A plain hero photo; the two
 * tracks side by side, each headed by its picture (a real Forge screen, a person); an
 * example launch as solid bars on one line; the therapeutic areas set large. Styles: cdev-
 * in SolutionsPages.css.
 */
export default function ContentPage({ content }) {
  const c = makeGetter(content);
  const hh = c('hero.headline');
  const headline = hh === HERO_HEADLINE_DEFAULT
    ? <>MLR-compliant content. <em>Built for field readiness.</em></>
    : hh;
  const contact = hrefFor('contact');
  const tracks = [
    {
      key: 'ai', title: c('track1.title'), photo: 'forge-workflow-desktop', screen: true,
      rows: [['Best for', c('track1.body')], ['Speed', 'Hours to a first draft'], ['Built by', 'Forge agents, with every claim cited']],
    },
    {
      key: 'human', title: c('track2.title'), photo: 'author-at-laptop', screen: false,
      rows: [['Best for', c('track2.body')], ['Speed', 'Paced for depth and nuance'], ['Built by', "Practitioners who've ridden along"]],
    },
  ];

  return (
    <>
      <section className="cdev-hero">
        <div className="cdev-hero-text">
          <div className="t-eyebrow">{c('hero.eyebrow')}</div>
          <h1 className="cdev-hero-h1">{headline}</h1>
          <p className="cdev-hero-sub">{c('hero.subhead')}</p>
          <Link href={contact} className="bp as-btn">{c('hero.ctaLabel')}</Link>
        </div>
        <div className="cdev-hero-photo">
          <Photo name="colleagues-at-laptop" sizes="(max-width: 960px) 100vw, 680px" position="55% 40%" priority />
        </div>
      </section>

      <section className="cdev-tracks cdev-wrap">
        <div className="t-eyebrow">{c('tracks.eyebrow')}</div>
        <h2 className="cdev-h2">{c('tracks.heading')}</h2>
        <div className="cdev-track-grid">
          {tracks.map((t) => (
            <article key={t.key} className="cdev-track">
              <div className={`cdev-track-img${t.screen ? ' cdev-track-screen' : ''}`}>
                <Photo name={t.photo} sizes="(max-width: 960px) 100vw, 600px" position={t.screen ? undefined : '50% 35%'} />
              </div>
              <h3>{t.title}</h3>
              <dl>
                {t.rows.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="cdev-both">
          <span className="cdev-both-label">{c('standards.label')}</span>
          <span className="cdev-both-items">
            {c('standards.item1.title')}<i aria-hidden="true">·</i>{c('standards.item2.title')}<i aria-hidden="true">·</i>{c('standards.item3.title')}
          </span>
        </p>
      </section>

      <section className="cdev-launch">
        <div className="cdev-wrap">
          <div className="t-eyebrow">{c('scenario.eyebrow')}</div>
          <h2 className="cdev-h2">{c('scenario.heading')}</h2>
          <div className="cdev-gantt">
            {LAUNCH.map((p) => (
              <div key={p.key} className="cdev-gantt-row">
                <div
                  className={`cdev-bar cdev-bar-${p.tone}`}
                  style={{ '--from': p.from / LAUNCH_MONTHS, '--span': (p.to - p.from) / LAUNCH_MONTHS }}
                >
                  <span className="cdev-bar-months">{p.months}</span>
                  <span className="cdev-bar-title">{c(`scenario.${p.key}.title`)}</span>
                </div>
              </div>
            ))}
            <div className="cdev-gantt-axis" aria-hidden="true">
              {Array.from({ length: LAUNCH_MONTHS + 1 }, (_, m) => <span key={m}>{m === LAUNCH_MONTHS ? 'Launch' : m || ''}</span>)}
            </div>
          </div>
          <p className="cdev-outcome">{c('scenario.outcome')}</p>
        </div>
      </section>

      <section className="cdev-areas cdev-wrap">
        <div className="t-eyebrow">{c('therapeutic.eyebrow')}</div>
        <h2 className="cdev-h2">{c('therapeutic.heading')}</h2>
        <ul className="cdev-area-list">
          {THERAPY_AREAS.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>
    </>
  );
}
