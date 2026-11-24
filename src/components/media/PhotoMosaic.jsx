import Photo from './Photo';

/** Three photographs as one block: a large one beside two stacked smaller ones. `photos` is three names. */
export default function PhotoMosaic({ photos, positions = [] }) {
  return (
    <div className="photo-mosaic">
      {photos.slice(0, 3).map((name, i) => (
        <div key={name} className="photo-mosaic-cell">
          <Photo name={name} position={positions[i]} sizes={i === 0 ? '(max-width: 960px) 100vw, 720px' : '(max-width: 960px) 50vw, 460px'} className="media-cover" />
        </div>
      ))}
    </div>
  );
}
