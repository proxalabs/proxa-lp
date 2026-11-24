'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/**
 * A floating "what's new" link pinned to the bottom right of the screen: a small white card
 * with a hairline drawing on the left (three bars rise, then an AI spark lights up, on a
 * loop), a "New" tag and the link text. `href` can be any address on the site or elsewhere,
 * and both it and `label` are editable in the CMS (Homepage, "Whats New"). It steps aside
 * while the footer is on screen so it never covers the footer's links. On phones it sits
 * centred at the bottom. The styles are under WHAT'S NEW BANNER in styles.css.
 */
export default function WhatsNewBanner({ label, href }) {
  const root = useRef(null);

  useEffect(() => {
    const footer = document.querySelector('.site-footer');
    if (!footer || !root.current) return undefined;
    const el = root.current;
    const observer = new IntersectionObserver(([entry]) => {
      el.classList.toggle('whats-new-away', entry.isIntersecting);
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!label || !href) return null;
  return (
    <Link ref={root} href={href} className="whats-new">
      <span className="wn-art" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path className="wn-base" pathLength="1" d="M7 31.5h26" />
          <path className="wn-bar" pathLength="1" d="M11 31.5v-6" style={{ '--i': 0 }} />
          <path className="wn-bar" pathLength="1" d="M17 31.5v-10" style={{ '--i': 1 }} />
          <path className="wn-bar" pathLength="1" d="M23 31.5v-8" style={{ '--i': 2 }} />
          <path className="wn-trend" pathLength="1" d="M8.5 22l7-5 5 2.5 7-7.5" />
          <path className="wn-spark" d="M30 6.5l1.4 3.6 3.6 1.4-3.6 1.4L30 16.5l-1.4-3.6-3.6-1.4 3.6-1.4z" />
        </svg>
      </span>
      <span className="wn-text">
        <span className="wn-tag">New</span>
        <span className="wn-label">{label}</span>
      </span>
      <svg className="wn-arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}
