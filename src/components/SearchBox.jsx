'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// Search-as-you-type: the query lives in the URL, so results are server-rendered
// and a search can be linked to or reloaded.
export default function SearchBox({ initialQuery }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (e) => {
    const value = e.target.value;
    setQ(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const term = value.trim();
      router.replace(term ? `/search?q=${encodeURIComponent(term)}` : '/search', { scroll: false });
    }, 250);
  };

  return (
    <form action="/search" role="search" onSubmit={(e) => e.preventDefault()}>
      <input className="search-input" name="q" autoFocus aria-label="Search the site"
        placeholder="Search articles, case studies, videos, pages…" value={q} onChange={onChange} />
    </form>
  );
}
