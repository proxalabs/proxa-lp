import Photo from '../media/Photo';

/** `photo` (a name from content/images.js) sets the quote over a photograph instead of the tinted card. */
export default function PullQuote({ quote, author, stats, photo, photoPosition, background = 'tinted' }) {
  const bg = background === 'tinted' ? 'section-tinted' : background === 'dark' ? 'section-dark' : 'section-light';
  return (
    <section className={`section ${bg}`}>
      <div className={photo ? 'pull-quote pull-quote-photo' : 'pull-quote'}>
        {photo && <Photo name={photo} position={photoPosition} sizes="(max-width: 1212px) 100vw, 1100px" className="pull-quote-bg" />}
        <div className="pull-quote-mark">"</div>
        <div className="pull-quote-content" style={{ gridTemplateColumns: stats?.length ? '1fr 220px' : '1fr' }}>
          <div>
            <p className="pull-quote-text">{quote}</p>
            {author && (
              <div className="pull-quote-attribution">
                {author.avatarInitials && (
                  <div className="pull-quote-avatar" style={{ background: author.avatarGradient || 'linear-gradient(135deg,#f5825f,#75abc0)' }}>
                    {author.avatarInitials}
                  </div>
                )}
                <div>
                  <div className="pull-quote-name">{author.name}</div>
                  {author.title && <div className="pull-quote-title">{author.title}</div>}
                  {author.company && <div className="pull-quote-company">{author.company}</div>}
                </div>
              </div>
            )}
          </div>
          {stats?.length > 0 && (
            <div className="pull-quote-stats">
              {stats.map(s => (
                <div key={s.n} className="pull-quote-stat">
                  <div className="pull-quote-stat-n">{s.n}</div>
                  <div className="pull-quote-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
