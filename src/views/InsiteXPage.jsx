import EditorialHero from '../components/sections/EditorialHero';
import LongForm from '../components/sections/LongForm';
import CardGrid from '../components/sections/CardGrid';
import UpgradeComparison from '../components/sections/UpgradeComparison';
import CountUp from '../components/CountUp';
import Icon from '../components/Icon';
import HeroPhoto from '../components/media/HeroPhoto';
import Photo from '../components/media/Photo';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';
import './InsiteXPage.css';

// Plain-text defaults for the headings that carry inline markup. While the
// content value equals one of these, the page renders the rich JSX version;
// once overridden in the CMS, it renders the (plain) override string. Keep these
// in sync with the matching `default`s in src/content/pages/insitex.js.
const HERO_HEADLINE_DEFAULT = 'The LMS that becomes the AI foundation.';
const UPGRADE_HEADING_DEFAULT = "Pick the right starting point. Upgrade when you're ready.";

const PROOF_NUMBERS = [
  { n: "4+",  l: "Years serving biopharma" },
  { n: "30+", l: "Pharma & health system clients" },
];

const CREDENTIALS = [
  { name: "SCORM, AICC, and PMRC",       status: "Compliant" },
  { name: "SOC 2 Type II",               status: "In progress" },
  { name: "Veeva PromoMats integration", status: "Native" },
  { name: "Enterprise SSO + RBAC",       status: "SAML 2.0 / OIDC" },
];

const CAPABILITIES = [
  { icon: <Icon name="lms" size={22} />,           title: "SCORM, AICC, and PMRC compliance", body: "All major pharma content standards supported out of the box. Drop in your existing libraries. No migration project." },
  { icon: <Icon name="audit" size={22} />,         title: "Credentialing + audit trails",     body: "Role-based credential tracking with full audit trails for regulatory inspection. 10-year retention, SHA-256 immutable logs." },
  { icon: <Icon name="governance" size={22} />,    title: "Veeva integration",                body: "Native bi-directional integration with Veeva PromoMats and Vault. Content state syncs automatically, both directions." },
  { icon: <Icon name="infrastructure" size={22} />, title: "Enterprise SSO + RBAC",           body: "SAML 2.0 and OIDC SSO. Granular role-based permissions across L&D, content, compliance, and IT teams." },
  { icon: <Icon name="content" size={22} />,        title: "Content lifecycle workflows",     body: "MLR routing, version control, and expiration tracking — built around how pharma content actually moves through approval." },
  { icon: <Icon name="readiness" size={22} />,     title: "Manager dashboards + reporting",   body: "Live readiness reporting by team, region, and competency. Pre-built reports for the CCO scorecard, training compliance, and certification expiration tracking." },
];

/** The figures and credentials either side of a man cut out of his photo, on white. */
function InsiteXProofPanel() {
  return (
    <section className="ix-proof">
      <div className="ix-proof-stage">
        <div className="ix-proof-side">
          <div className="ix-proof-label">By the numbers</div>
          <ul className="ix-proof-numbers">
            {PROOF_NUMBERS.map((s) => (
              <li key={s.n}>
                <strong><CountUp>{s.n}</CountUp></strong>
                <span>{s.l}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ix-proof-person">
          <Photo name="man-laptop-cutout" sizes="(max-width: 960px) 80vw, 460px" />
        </div>
        <div className="ix-proof-side">
          <div className="ix-proof-label">Credentials &amp; compliance</div>
          <ul className="ix-creds">
            {CREDENTIALS.map((cred) => (
              <li key={cred.name}>
                <span className="ix-cred-check" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.2 L5 8.6 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span><strong>{cred.name}</strong> <span className="ix-cred-status">{cred.status}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function InsiteXPage({ content }) {
  const c = makeGetter(content);

  // Headings with inline markup: keep the rich JSX default, render plain string
  // when overridden.
  const heroH = c('hero.headline');
  const heroHeadline = heroH === HERO_HEADLINE_DEFAULT
    ? <>The LMS that becomes <em>the AI foundation.</em></>
    : heroH;
  const upgradeH = c('upgrade.heading');
  const upgradeHeading = upgradeH === UPGRADE_HEADING_DEFAULT
    ? <>Pick the right starting point.<br />Upgrade when you're ready.</>
    : upgradeH;

  // Capability cards keep their in-code icons; title/body are CMS-overridable.
  const capabilityCards = CAPABILITIES.map((card, i) => ({
    ...card,
    title: c(`capabilities.cards.${i}.title`),
    body: c(`capabilities.cards.${i}.body`),
  }));

  return (
    <>
      <EditorialHero
        eyebrow={c('hero.eyebrow')}
        headline={heroHeadline}
        subhead={c('hero.subhead')}
        visual={(
          <HeroPhoto
            name="employee-at-laptop"
            position="50% 50%"
            chip={{ mark: <Icon name="lms" size={18} />, title: 'InsiteX LMS', text: 'Built for biopharma compliance' }}
          />
        )}
        primaryCta={{ label: c('hero.ctaLabel'), href: hrefFor("contact") }}
      />

      <LongForm
        eyebrow={c('whenRight.eyebrow')}
        heading={c('whenRight.heading')}
      >
        <p>{c('whenRight.body')}</p>
      </LongForm>

      <InsiteXProofPanel />

      <CardGrid
        eyebrow={c('capabilities.eyebrow')}
        heading={c('capabilities.heading')}
        columns={2}
        cards={capabilityCards}
        cardStyle="standard"
        background="tinted"
      />

      <UpgradeComparison
        eyebrow={c('upgrade.eyebrow')}
        heading={upgradeHeading}
        lead={c('upgrade.lead')}
      />
    </>
  );
}
