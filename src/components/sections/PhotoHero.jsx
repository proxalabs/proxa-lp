import Cta from '../Cta';
import Photo from '../media/Photo';

/**
 * The home page's hero: a photograph filling the screen under the menu, with the headline,
 * a line under it and two links over the picture's bright side. `photo` is a name in
 * content/images.js. The picture sits to the right and its left edge fades into the hero's
 * background, so the words always stand on a plain surface. On a narrow screen the words
 * come first and the photograph follows them.
 */
export default function PhotoHero({ eyebrow, headline, subhead, primaryCta, secondaryLink, photo }) {
  return (
    <section className="photo-hero">
      <div className="photo-hero-words">
        {eyebrow && <div className="t-eyebrow photo-hero-eyebrow">{eyebrow}</div>}
        <h1 className="photo-hero-headline">{headline}</h1>
        {subhead && <p className="photo-hero-subhead">{subhead}</p>}
        <div className="photo-hero-actions">
          <Cta cta={primaryCta} className="photo-hero-button">
            <span aria-hidden="true">→</span>
          </Cta>
          <Cta cta={secondaryLink} className="photo-hero-link" />
        </div>
      </div>
      <div className="photo-hero-picture">
        <Photo name={photo} sizes="(max-width: 900px) 100vw, 70vw" priority />
      </div>
    </section>
  );
}
