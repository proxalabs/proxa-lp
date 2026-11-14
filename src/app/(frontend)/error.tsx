'use client'

import { useEffect } from 'react'

// One bad page shows a recoverable message instead of white-screening the site.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error)).catch(() => {})
    }
  }, [error])

  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-manrope), system-ui, sans-serif', fontSize: 24, fontWeight: 800, color: '#12141A', margin: '0 0 10px' }}>Something went wrong</h1>
        <p style={{ color: '#5C6370', margin: '0 0 20px' }}>Please reload the page to continue.</p>
        <button
          onClick={() => reset()}
          style={{ background: '#f5825f', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', font: 'inherit' }}
        >
          Reload
        </button>
      </div>
    </div>
  )
}
