// Error monitoring in the browser (Sentry). The SDK is a separate chunk that is
// only downloaded when a DSN is configured, so it costs nothing otherwise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
      })
    })
    .catch(() => {
      /* monitoring must never break the page */
    })
}
