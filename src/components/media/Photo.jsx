import { PHOTOS, SCREENS, imageProps } from '../../content/images';

/**
 * One of the site's photographs or product screenshots, by its name in content/images.js.
 * `sizes` tells the browser how wide it is shown, so phones fetch the small file.
 * `priority` is for an image visible on first load: it is fetched at once, not lazily.
 * `position` is a CSS object-position, for choosing what stays in view when it is cropped.
 */
export default function Photo({ name, sizes, priority = false, position, className, style }) {
  const image = PHOTOS[name] || SCREENS[name];
  if (!image) return null;
  return (
    <img
      {...imageProps(image, sizes)}
      className={className}
      style={position ? { objectPosition: position, ...style } : style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      draggable={false}
    />
  );
}
