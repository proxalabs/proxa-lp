import Link from 'next/link';
import CountUp from '../components/CountUp';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './AboutPage.css';

// The story is three long paragraphs (the CMS's story fields). Each is shown as a numbered
// chapter with a short title, so the page reads in steps instead of as one block of text.
const CHAPTERS = [
  { title: 'The pressure', key: 'story.p1' },
  { title: 'The proof', key: 'story.p2' },
  { title: 'The practice', key: 'story.p3' },
];

// How every engagement starts, as the story's last chapter says it.
const FIRST_STEPS = [
  { title: 'Define the problem', body: 'We agree what the commercial team needs to do better before any tool or vendor is on the table.' },
  { title: 'Assess readiness', body: 'We map how ready the organization is to adopt AI, so the plan fits where you actually are.' },
  { title: 'Experiment first', body: 'Structured experiments produce evidence in your environment before a dollar is committed to a solution.' },
];

// The headline keeps its orange second half by default, but renders a plain string when an
// editor overrides it. This must match the manifest default.
const ABOUT_HERO_HEADLINE_DEFAULT = "Built by someone who's been in your seat.";

/**
 * About: "built by someone who's been in your seat". A hero set in very large type with the
 * three proof figures under it; the story as three chapters beside a photo; and how every
 * engagement starts, with a woman cut out of her photo standing in the middle of the three
 * steps and the closing call to action. Styles: AboutPage.css.
 */
export default function AboutPage({ content }) {
  const c = makeGetter(content);
  const hh = c('hero.headline');
  const headline = hh === ABOUT_HERO_HEADLINE_DEFAULT
    ? <>Built by someone who's <em>been in your seat.</em></>
    : hh;
  const stats = [0, 1, 2].map((i) => ({ n: c(`stats.${i}.n`), l: c(`stats.${i}.l`) }));

  return (
    <>
      <section className="ab-hero">
        <div className="t-eyebrow">{c('hero.eyebrow')}</div>
        <h1 className="ab-hero-h1">{headline}</h1>
        <div className="ab-hero-foot">
          <p className="ab-hero-sub">{c('hero.subhead')}</p>
          <ul className="ab-stats">
            {stats.map((s) => (
              <li key={s.l}>
                <strong><CountUp>{s.n}</CountUp></strong>
                <span>{s.l}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ab-story">
        <div className="ab-story-side">
          <div className="t-eyebrow">{c('story.eyebrow')}</div>
          <h2 className="ab-h2">{c('story.heading')}</h2>
          <div className="ab-story-photo">
            <Photo name="team-chart-review" sizes="(max-width: 960px) 100vw, 440px" position="6% 50%" />
          </div>
        </div>
        <ol className="ab-chapters">
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter.key} className="ab-chapter">
              <span className="ab-chapter-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="ab-chapter-title">{chapter.title}</h3>
                <p>{c(chapter.key)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ab-how">
        <div className="ab-how-head">
          <div className="t-eyebrow">How we work</div>
          <h2 className="ab-h2">Every engagement starts the same way.</h2>
        </div>
        <div className="ab-how-stage">
          <ol className="ab-steps">
            {FIRST_STEPS.slice(0, 2).map((s, i) => (
              <li key={s.title} className="ab-step">
                <span className="ab-step-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="ab-how-person">
            <Photo name="woman-laptop-cutout" sizes="(max-width: 960px) 60vw, 340px" />
          </div>
          <div className="ab-how-right">
            <ol className="ab-steps" start={3}>
              <li className="ab-step">
                <span className="ab-step-n">3</span>
                <h3>{FIRST_STEPS[2].title}</h3>
                <p>{FIRST_STEPS[2].body}</p>
              </li>
            </ol>
            <div className="ab-cta">
              <h3>{c('cta.heading')}</h3>
              <p>{c('cta.body')}</p>
              <Link href={hrefFor('contact')} className="bp as-btn">{c('cta.ctaLabel')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
