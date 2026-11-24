import FloatingFrame from './FloatingFrame';
import Photo from './Photo';

/**
 * The photograph beside a page's headline: a tall rounded picture that floats, with an
 * optional small label card (`chip`: { mark, title, text }) overlapping its corner.
 */
export default function HeroPhoto({ name, position, aspect = '5 / 5.6', chip }) {
  const label = chip && (
    <div className="media-chip">
      {chip.mark && <span className="media-chip-mark">{chip.mark}</span>}
      <span className="media-chip-text">
        <strong>{chip.title}</strong>
        {chip.text && <span>{chip.text}</span>}
      </span>
    </div>
  );
  return (
    <div className="hero-photo">
      <FloatingFrame aspect={aspect} radius={28} overlay={label} lift={34}>
        <Photo name={name} position={position} sizes="(max-width: 960px) 100vw, 560px" priority className="media-cover" />
      </FloatingFrame>
    </div>
  );
}
