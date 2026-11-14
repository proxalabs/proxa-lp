'use client';

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react';
import { usePathname, useRouter } from 'next/navigation';

// Shown only to an editor in draft mode: refreshes the page as they type in the
// CMS, and offers a way back to the published site.
export default function PreviewBar() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <>
      <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={typeof window === 'undefined' ? '' : window.location.origin} />
      <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 1000, display: 'flex', gap: 12, alignItems: 'center', padding: '8px 14px', borderRadius: 10, background: '#12141A', color: '#fff', font: '600 13px var(--font-dm-sans), sans-serif', boxShadow: '0 6px 24px rgba(0,0,0,.25)' }}>
        <span>Previewing unpublished changes</span>
        <a href={`/next/exit-preview?path=${encodeURIComponent(pathname)}`} style={{ color: '#f5825f', textDecoration: 'none' }}>Exit preview</a>
      </div>
    </>
  );
}
