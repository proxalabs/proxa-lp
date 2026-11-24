import Cta from '../Cta';

export default function EditorialHero({ eyebrow, headline, subhead, primaryCta, secondaryLink, visual, badge, dark = false, className = '' }) {
  const hasVisual = !!visual;
  return (
    <section className={`${dark ? 'editorial-hero editorial-hero-dark' : 'editorial-hero'} ${className}`.trim()}>
      <div className={hasVisual ? 'editorial-hero-inner' : 'editorial-hero-inner editorial-hero-inner-solo'}>
        <div className="editorial-hero-content">
          {badge && <div className="editorial-hero-badge">{badge}</div>}
          {eyebrow && <div className="t-eyebrow editorial-hero-eyebrow">{eyebrow}</div>}
          <h1 className="t-display editorial-hero-headline">{headline}</h1>
          {subhead && <p className="editorial-hero-subhead">{subhead}</p>}
          {(primaryCta || secondaryLink) && (
            <div className="editorial-hero-actions">
              <Cta cta={primaryCta} className="bp" />
              <Cta cta={secondaryLink} className="quiet-link">
                <span className="quiet-link-arrow">→</span>
              </Cta>
            </div>
          )}
        </div>
        {visual && <div className="editorial-hero-visual">{visual}</div>}
      </div>
    </section>
  );
}
