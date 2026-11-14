import Link from 'next/link';

export default function CardGrid({
  eyebrow,
  heading,
  lead,
  columns = 3,
  cards,
  cardStyle = 'standard',
  background = 'light',
  centerHeader = false,
  leadMaxWidth = 600,
  media,
  className = '',
}) {
  const bg = background === 'tinted' ? 'section-tinted' : background === 'dark' ? 'section-dark' : 'section-light';
  const padding = cardStyle === 'compact' ? 'var(--space-4)' : cardStyle === 'feature' ? 'var(--space-6)' : 'var(--space-5)';

  return (
    <section className={`section ${bg} ${className}`.trim()}>
      <div className="mw">
        {(eyebrow || heading || lead) && (
          <div className={centerHeader ? 'card-grid-header card-grid-header-center' : 'card-grid-header'}>
            {eyebrow && <div className="t-eyebrow" style={{ marginBottom: 'var(--space-2)' }}>{eyebrow}</div>}
            {heading && <h2 className="t-h2" style={{ marginBottom: 'var(--space-3)' }}>{heading}</h2>}
            {lead && <p className="t-lead" style={{ maxWidth: leadMaxWidth, margin: centerHeader ? '0 auto' : 0 }}>{lead}</p>}
          </div>
        )}
        {media && <div className="card-grid-media">{media}</div>}
        <div className={`card-grid card-grid-${columns}`}>
          {cards.map((c, i) => {
            // A card with an href is one big link; without one it is plain content.
            const Card = c.href ? Link : 'div';
            const linkProps = c.href ? { href: c.href } : {};
            return (
              <Card
                key={c.title || i}
                {...linkProps}
                className={c.href ? 'card-grid-card as-block' : 'card-grid-card'}
                style={{ padding, cursor: c.href ? 'pointer' : 'default' }}
              >
                {c.icon && <div className="card-grid-card-icon">{c.icon}</div>}
                {c.tag && <div className="card-grid-card-tag" style={c.tagColor ? { color: c.tagColor, background: c.tagColor + '12' } : undefined}>{c.tag}</div>}
                <div className="card-grid-card-title">{c.title}</div>
                <div className="card-grid-card-body">{c.body}</div>
                {c.linkLabel && <div className="card-grid-card-link">{c.linkLabel} →</div>}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
