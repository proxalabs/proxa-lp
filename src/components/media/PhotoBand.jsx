import Photo from './Photo';

/** A wide rounded photograph that spans its section. */
export default function PhotoBand({ name, position, aspect = '21 / 9' }) {
  return (
    <div className="photo-band" style={{ aspectRatio: aspect }}>
      <Photo name={name} position={position} sizes="(max-width: 1280px) 100vw, 1200px" className="media-cover" />
    </div>
  );
}
