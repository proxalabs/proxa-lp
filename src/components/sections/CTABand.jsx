import { HexMark } from '../HexMark';
import Cta from '../Cta';

export default function CTABand({ heading, body, primaryCta, secondaryLink }) {
  return (
    <section className="cta-band">
      <div className="cta-band-watermark">
        <HexMark size={420} color="#f5825f" strokeWidth={0.7} />
      </div>
      <div className="cta-band-content">
        <h2 className="cta-band-heading">{heading}</h2>
        {body && <p className="cta-band-body">{body}</p>}
        <div className="cta-band-actions">
          <Cta cta={primaryCta} className="bp" />
          <Cta cta={secondaryLink} className="quiet-link">
            <span className="quiet-link-arrow">→</span>
          </Cta>
        </div>
      </div>
    </section>
  );
}
