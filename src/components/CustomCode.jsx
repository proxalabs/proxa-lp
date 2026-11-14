'use client';

import { useEffect } from 'react';

// Per-page custom code (admin-authored, trusted): tracking pixels and the like.
// Injected into <head> when the page is shown and removed on navigation, so it
// never leaks onto the next page.
export default function CustomCode({ code }) {
  useEffect(() => {
    const holder = document.createElement('div');
    holder.id = 'cms-page-custom';
    holder.innerHTML = code;
    // Scripts set through innerHTML do not run; re-create them so they do.
    holder.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      for (const a of old.attributes) s.setAttribute(a.name, a.value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    document.head.appendChild(holder);
    return () => holder.remove();
  }, [code]);
  return null;
}
