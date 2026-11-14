// Runs once when the server starts.

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Error monitoring on the server, when a DSN is configured.
  if (sentryDsn) {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    })
  }

  // Payload only starts its job runner when asked to, and the admin is what
  // normally asks; starting it here means scheduled posts publish on time even if
  // nobody has opened the CMS since the last restart.
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
    await getPayload({ config, cron: true })
  } catch (err) {
    // The site can still serve pages; the admin will start the runner on first use.
    console.error('Could not start the scheduled-publishing job runner:', err)
  }
}

// Report errors thrown while rendering a page or handling a request.
export async function onRequestError(...args: unknown[]) {
  if (!sentryDsn) return
  const Sentry = await import('@sentry/nextjs')
  ;(Sentry.captureRequestError as (...a: unknown[]) => void)(...args)
}
