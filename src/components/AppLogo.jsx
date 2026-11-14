import { APP_GLYPH_COLOR, APP_LOGOS } from './appLogos';

/**
 * The official logo of a Proxa app ('forge' | 'cue' | 'stage' | 'trace') as a
 * rounded tile. Decorative: show the app's name next to it.
 */
export default function AppLogo({ app, size = 26, className, style }) {
  const logo = APP_LOGOS[app];
  if (!logo) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" className={className} style={{ flexShrink: 0, ...style }} aria-hidden="true">
      <rect width="26" height="26" rx="7" fill={logo.color} />
      <svg x="6" y="6" width="14" height="14" viewBox={logo.viewBox}>
        <path fill={APP_GLYPH_COLOR} d={logo.d} />
      </svg>
    </svg>
  );
}
