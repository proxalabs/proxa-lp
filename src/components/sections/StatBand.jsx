import CountUp from '../CountUp';

/**
 * A row of figures, each on its own light card: the number, what it measures and, when one
 * is given, where it comes from. `stats` are `{ n, l, source? }`; the cards share the row's
 * width, however many there are. Each number counts up from zero as it comes into view.
 */
export default function StatBand({ stats }) {
  return (
    <section className="stat-band">
      <div className="stat-band-row">
        {stats.map(s => (
          <div key={s.n} className="stat-band-stat">
            <div className="stat-band-n"><CountUp>{s.n}</CountUp></div>
            <div className="stat-band-l">{s.l}</div>
            {s.source && <div className="stat-band-source">{s.source}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
