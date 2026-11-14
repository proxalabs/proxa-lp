// Runs once when the server starts. Payload only starts its job runner when asked
// to, and the admin is what normally asks; starting it here means scheduled posts
// publish on time even if nobody has opened the CMS since the last restart.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
    await getPayload({ config, cron: true })
  } catch (err) {
    // The site can still serve pages; the admin will start the runner on first use.
    console.error('Could not start the scheduled-publishing job runner:', err)
  }
}
