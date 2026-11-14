'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, initGtm, trackPageView } from '../analytics';

// GA4 + optional GTM. Page views are sent on every client-side navigation, as the
// old single-page app did; nothing is tracked in development or on localhost.
export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => { initAnalytics(); initGtm(); }, []);
  useEffect(() => {
    trackPageView(window.location.pathname + window.location.hash, document.title);
  }, [pathname]);
  return null;
}
