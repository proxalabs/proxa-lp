'use client';

import { useMemo } from 'react';
import LogoLoop from '../reactbits/LogoLoop';

// Logos differ a lot in shape, so one shared height would make long wordmarks huge and
// compact marks tiny. Each gets about the same area instead, within these height limits (px).
const AREA = 4200;
const MIN_HEIGHT = 20;
const MAX_HEIGHT = 46;

function logoSize({ w, h, scale = 1 }) {
  const ratio = w / h;
  const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.sqrt(AREA / ratio))) * scale;
  return { '--w': Math.round(height * ratio), '--h': Math.round(height) };
}

/**
 * Two rows of client logos that scroll sideways without end in opposite directions, fade out
 * at both edges, pause under the pointer and can be dragged. Each row is React Bits' LogoLoop
 * with the site's settings (slow, and no entrance animation, so the logos are painted with
 * the page). The logos are dealt to the rows in turn, so both get a mix of shapes.
 *
 * Each logo is a single-colour SVG used as a CSS mask over a block of the text colour, which
 * is what lets a row draw every logo grey and turn the one under the pointer brand orange.
 * `logos` is the list in src/content/clientLogos.js; `label` names the rows for screen readers.
 */
export default function ClientLogoLoop({ logos, label }) {
  const rows = useMemo(() => {
    const items = logos.map((logo) => ({
      hoverColor: 'var(--o)',
      node: (
        <span
          className="lb-logo"
          role="img"
          aria-label={logo.name}
          style={{ ...logoSize(logo), '--logo': `url(/assets/logos/clients/${logo.file}.svg)` }}
        />
      ),
    }));
    return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];
  }, [logos]);
  return (
    <>
      {rows.map((row, i) => (
        <LogoLoop
          key={i}
          className="lb-loop"
          logos={row}
          ariaLabel={`${label}, row ${i + 1} of ${rows.length}`}
          direction={i % 2 === 0 ? 'left' : 'right'}
          speed={45}
          gap={56}
          fadeOutWidth={0.05}
          intro={false}
        />
      ))}
    </>
  );
}
