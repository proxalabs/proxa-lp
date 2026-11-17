'use client';

import { useMemo } from 'react';
import LogoLoop from '../reactbits/LogoLoop';

/**
 * A row of organisation names that scrolls sideways without end, fades out at both edges,
 * pauses under the pointer and can be dragged. This is React Bits' LogoLoop with the
 * site's settings (slow, and no entrance animation, so the names are painted with the
 * page). The names are text; LogoLoop also takes logo files as `{ src, alt }` items.
 * `label` names the row for screen readers.
 */
export default function NameLoop({ names, label }) {
  const logos = useMemo(() => names.map((name) => ({ node: <span className="lb-co">{name}</span> })), [names]);
  return <LogoLoop className="lb-loop" logos={logos} ariaLabel={label} speed={45} gap={40} fadeOutWidth={0.05} intro={false} />;
}
