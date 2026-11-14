import Photo from './Photo';

/**
 * A wide rounded photograph that spans its section. With a `caption` ({ title, text }),
 * those words sit over the left of the photo on a dark fade.
 */
export default function PhotoBand({ name, position, aspect = '21 / 9', caption }) {
  const Band = caption ? 'figure' : 'div';
  return (
    <Band className={caption ? 'photo-band photo-band-captioned' : 'photo-band'} style={{ aspectRatio: aspect }}>
      <Photo name={name} position={position} sizes="(max-width: 1280px) 100vw, 1200px" className="media-cover" />
      {caption && (
        <figcaption className="photo-band-caption">
          <p className="photo-band-title">{caption.title}</p>
          {caption.text && <p className="photo-band-text">{caption.text}</p>}
        </figcaption>
      )}
    </Band>
  );
}
