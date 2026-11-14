import Cta from '../Cta';
import ProductGlimpse from '../media/ProductGlimpse';

/**
 * A dark panel showing real product screens (a floating browser window and phone) beside
 * a short piece of text. `desktop` and `mobile` are screenshot names from content/images.js.
 */
export default function ProductStage({ eyebrow, heading, body, cta, note, desktop, mobile, url }) {
  return (
    <section className="section section-tinted product-stage-section">
      <div className="product-stage">
        <div className="product-stage-text">
          {eyebrow && <div className="t-eyebrow">{eyebrow}</div>}
          {heading && <h2 className="t-h2">{heading}</h2>}
          {body && <p>{body}</p>}
          <Cta cta={cta} className="bp" />
          {note && <div className="product-stage-note">{note}</div>}
        </div>
        <ProductGlimpse desktop={desktop} mobile={mobile} url={url} />
      </div>
    </section>
  );
}
