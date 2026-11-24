'use client';

import { useEffect, useMemo, useRef } from 'react';
import { figureAt, parseFigure } from '../lib/countUp';

const DURATION = 1600; // milliseconds
const easeOut = (t) => 1 - (1 - t) ** 4;

/**
 * A figure that counts up from zero the first time it scrolls into view: "84%" runs from
 * 0% to 84%, "80–95%" runs both numbers, "5,000+" keeps its comma. Text with nothing to
 * count ("LMS", "1st", "0") is shown as it is.
 *
 * The figure as written is what React renders and it never leaves the page, for search
 * engines, screen readers, and anyone without scripts or who has asked for less motion.
 * The running count is a second element this component lays over it and removes when the
 * count ends; `data-state` on the wrapper tells the styles which of the two to show (see
 * COUNTING FIGURES in styles.css).
 */
export default function CountUp({ children }) {
  const parts = useMemo(() => parseFigure(children), [children]);
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!parts || !el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const live = document.createElement('span');
    live.className = 'count-up-live';
    live.setAttribute('aria-hidden', 'true');
    live.textContent = figureAt(parts, 0);
    el.append(live);
    el.dataset.state = 'armed';

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const began = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - began) / DURATION);
        live.textContent = figureAt(parts, easeOut(t));
        if (t < 1) {
          frame = requestAnimationFrame(step);
        } else {
          live.remove();
          el.dataset.state = 'done';
        }
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      live.remove();
      delete el.dataset.state;
    };
  }, [parts]);

  if (!parts) return children;
  return (
    <span ref={root} className="count-up">
      <span className="count-up-final">{children}</span>
    </span>
  );
}
