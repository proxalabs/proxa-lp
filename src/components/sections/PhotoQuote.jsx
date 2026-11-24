import CountUp from '../CountUp';
import Photo from '../media/Photo';

/**
 * A customer quote on a full-width photograph: the person's face on the right, the quote in
 * white on the photo's darker left side, with no wash over the picture. Under the name, a
 * row of figures that count up. `photo` is a name from content/images.js; `position` is its
 * object-position on wide screens and `phonePosition` on phones, where the picture sits on
 * top and the words follow on a plain `tone` that matches the photo's background.
 */
export default function PhotoQuote({ kicker, quote, name, title, stats = [], photo, position, phonePosition, tone = '#2a1d17' }) {
  return (
    <section className="photo-quote-section">
      <figure className="photo-quote" style={{ '--pq-pos': position, '--pq-pos-phone': phonePosition || position, '--pq-tone': tone }}>
        <Photo name={photo} sizes="(max-width: 960px) 100vw, 1328px" className="photo-quote-img" />
        <div className="photo-quote-words">
          {kicker && <div className="photo-quote-kicker">{kicker}</div>}
          <blockquote className="photo-quote-text">“{quote}”</blockquote>
          <figcaption className="photo-quote-by">
            <strong>{name}</strong>
            {title && <span>{title}</span>}
          </figcaption>
          {stats.length > 0 && (
            <dl className="photo-quote-stats">
              {stats.map((s) => (
                <div key={s.l}>
                  <dt><CountUp>{s.n}</CountUp></dt>
                  <dd>{s.l}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </figure>
    </section>
  );
}
